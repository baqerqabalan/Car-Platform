const Sale = require("../models/salesModel");
const Product = require("../models/productPostModel");
const Auction = require("../models/auctionModel");
const User = require("../models/userModel");
const Advertisements = require('../models/advertisementModel');
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const { sendEmail } = require("../utils/emailWithPdf");

exports.createSale = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;

    // Find the product by ID
    const product = await Product.findById(productId);
    const sellerUser = await User.findById(product.sellerId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!sellerUser) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Assuming seller info is part of the product or request body
    const { firstName, lastName, email, phone, address } = req.body.seller_Info;

    // Prepare the sale data
    const saleData = {
      productId,
      userId,
      seller_Info: {
        firstName,
        lastName,
        email,
        phone,
        address,
      },
    };

    // Conditionally add auctionId if the product is an auction
    if (product.is_auction && product.status === "inactive") {
      const auction = await Auction.findOne({ productId: productId });

      if (!auction) {
        return res.status(404).json({ message: "Auction Not Found" });
      }

      saleData.auctionId = auction._id;
      saleData.price = auction.highestBid;
    } else {
      saleData.price = product.price;
    }

    // Create the sale
    const newSale = await Sale.create(saleData);

    // Update product status to inactive
    product.status = "inactive";
    await product.save();

    if (newSale) {
      // Generate PDF of the reservation bill
      const pdfBuffer = await generateReservationBill(newSale);
      const sellerPdfBuffer = await generateSellerReservationBill(newSale, sellerUser);

      if (!pdfBuffer) {
        return res
          .status(500)
          .json({ message: "Failed to generate reservation bill." });
      }

      if(!sellerPdfBuffer){
        return res
          .status(500)
          .json({ message: "Failed to generate reservation bill." });
      }

      // Prepare email options
      const emailOptions = {
        email: saleData.seller_Info.email, // Send to the seller's email
        subject: "Your Reservation Bill",
        message: `Dear ${saleData.seller_Info.firstName},\n\nThank you for your reservation. Please find the reservation bill attached.`,
        pdfBuffer: pdfBuffer, // Attach the generated PDF
      };

      const mailSenderOptions = {
        email: sellerUser.email,
        subject: "Product Purchased",
        message: `Dear ${sellerUser.firstName}, \n\nYour product has been purchased by ${saleData.seller_Info.firstName} ${saleData.seller_Info.lastName} with price $${saleData.price}. Please find the reservation bill attached.`,
        pdfBuffer: sellerPdfBuffer,
      }

      try {
        await sendEmail(emailOptions);
      } catch (error) {
        console.error("Error sending email to buyer:", error);
      }
      
      try {
        await sendEmail(mailSenderOptions);
      } catch (error) {
        console.error("Error sending email to seller:", error);
      }
      
      const advertisement = await Advertisements.findOne({productId});
      if(advertisement){
        advertisement.status = "hasPublished";
        await advertisement.save();
      }
      

      return res.status(201).json({
        message:
          "Sale created successfully and email sent with reservation bill.",
        sale: newSale,
      });
    }
  } catch (error) {
    console.error("Error creating sale:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const generateReservationBill = async (newSale) => {
  try {
    const reservationDate = moment(newSale.createdAt).format(
      "DD/MM/YYYY HH:mm"
    );

    // Fetch product details related to the sale
    const product = await Product.findById(newSale.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Fetch seller information
    const seller = await User.findById(product.sellerId);
    if (!seller) {
      throw new Error("Seller not found");
    }

    // Prepare to generate the PDF
    const doc = new PDFDocument();
    const buffers = [];

    // Capture the PDF output in memory
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      // Return the generated buffer for sending later
      Buffer.concat(buffers); 
    });

    // Company Logo
    const logoPath = path.resolve(
      __dirname,
      "../../client/src/assets/images/black logo.png"
    );
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 20, { width: 100 });
    }

    // Header: Title and Date
    doc
      .fontSize(20)
      .text("RESERVATION BILL", { align: "center" })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Date of Issue: ${moment().format("DD/MM/YYYY")}`, {
        align: "right",
      })
      .moveDown();

    // Divider Line
    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Reservation Date
    doc
      .moveDown()
      .fontSize(12)
      .text(`Reservation Date: ${reservationDate}`, { align: "left" })
      .moveDown(1);

    // Buyer Information
    doc
      .fontSize(14)
      .text("Buyer Information:", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(
        `Name: ${newSale.seller_Info.firstName} ${newSale.seller_Info.lastName}`
      )
      .text(`Email: ${newSale.seller_Info.email}`)
      .text(`Phone Number: ${newSale.seller_Info.phone}`)
      .text(`Address: ${newSale.seller_Info.address}`)
      .moveDown(1);

    // Item Information
    doc
      .fontSize(14)
      .text("Item Reserved:", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Item Name: ${product.name}`)
      .text(`Category: ${product.category}`)
      .text(`Seller: ${seller.firstName} ${seller.lastName}`)
      .moveDown(1);

    // Price Information
    doc
      .fontSize(14)
      .text("Price Details:", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Total Price: $${newSale.price}`)
      .moveDown(2);

    // Formal Statement
    doc
      .fontSize(12)
      .text(
        `You, ${newSale.seller_Info.firstName} ${newSale.seller_Info.lastName}, have successfully reserved the item "${product.name}" from ${seller.firstName} ${seller.lastName} on ${reservationDate}. The total price for this reservation is $${newSale.price}.`,
        {
          align: "left",
          lineGap: 5,
        }
      )
      .moveDown(2);

    // Footer: Thank You Note
    doc
      .fontSize(14)
      .text("Thank you for your reservation!", {
        align: "center",
        italic: true,
      })
      .moveDown(2);

    // Footer: Company Details (optional)
    doc
      .fontSize(10)
      .text("Carisco | carisco@gmail.com", { align: "center" })
      .fontSize(12)
      .fillColor("#0000EE")
      .text("http://localhost:3000", {
        align: "center",
        underline: true,
        link: "http://localhost:3000",
      }); // "Website:" with continued: true

    // Finalize the PDF
    doc.end();

    return new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));
      });
  } catch (error) {
    console.error(error);
    return null;
  }
};

const generateSellerReservationBill = async (newSale, seller) => {
  try {
    const reservationDate = moment(newSale.createdAt).format(
      "DD/MM/YYYY HH:mm"
    );

    // Fetch product details related to the sale
    const product = await Product.findById(newSale.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Prepare to generate the PDF
    const doc = new PDFDocument();
    const buffers = [];

    // Capture the PDF output in memory
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      // Return the generated buffer for sending later
      Buffer.concat(buffers); 
    });

    // Company Logo (update path to your logo on the server-side)
    const logoPath = path.resolve(
      __dirname,
      "../../client/src/assets/images/black logo.png"
    );
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 20, { width: 100 });
    }

    // Header: Title and Date
    doc
      .fontSize(20)
      .text("RESERVATION BILL", { align: "center" })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Date of Issue: ${moment().format("DD/MM/YYYY")}`, {
        align: "right",
      })
      .moveDown();

    // Divider Line
    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Reservation Date
    doc
      .moveDown()
      .fontSize(12)
      .text(`Reservation Date: ${reservationDate}`, { align: "left" })
      .moveDown(1);

    // Buyer Information
    doc
      .fontSize(14)
      .text("Buyer Information:", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(
        `Name: ${newSale.seller_Info.firstName} ${newSale.seller_Info.lastName}`
      )
      .text(`Email: ${newSale.seller_Info.email}`)
      .text(`Phone Number: ${newSale.seller_Info.phone}`)
      .text(`Address: ${newSale.seller_Info.address}`)
      .moveDown(1);

    // Item Information
    doc
      .fontSize(14)
      .text("Item Reserved:", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Item Name: ${product.name}`)
      .text(`Category: ${product.category}`)
      .text(`Seller: ${seller.firstName} ${seller.lastName}`)
      .moveDown(1);

    // Price Information
    doc
      .fontSize(14)
      .text("Price Details:", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Total Price: $${newSale.price}`)
      .moveDown(2);

    // Formal Reservation Statement
    doc
      .fontSize(12)
      .text(
        `Dear ${seller.firstName} ${seller.lastName},\n\nWe are pleased to inform you that your product "${product.name}" has been successfully reserved by ${newSale.seller_Info.firstName} ${newSale.seller_Info.lastName} on ${reservationDate}. The total reservation price is $${newSale.price}.\n\nPlease proceed with the necessary steps to finalize the transaction and contact the customer either by phone number or email. Thank you for using our platform to manage your product sales.`,
        {
          align: "left",
          lineGap: 5,
        }
      )
      .moveDown(2);

    // Footer: Thank You Note
    doc
      .fontSize(14)
      .text("Thank you for your reservation!", {
        align: "center",
        italic: true,
      })
      .moveDown(2);

    // Footer: Company Details (optional)
    doc
      .fontSize(10)
      .text("Carisco | carisco@gmail.com", { align: "center" })
      .fontSize(12)
      .fillColor("#0000EE")
      .text("http://localhost:3000", {
        align: "center",
        underline: true,
        link: "http://localhost:3000",
      }); // "Website:" with continued: true

    // Finalize the PDF
    doc.end();

    return new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));
      });
  } catch (error) {
    console.error(error);
    return null;
  }
};

exports.createReservationBill = async (req, res) => {
  try{
  const user = req.user._id;
  const productId = req.params.productId;

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if(!productId){
    return res.status(404).json({ message: "Product not found" });
  }

  const newSale = await Sale.findOne({ userId: user, productId });

  if (!newSale) {
    return res.status(404).json({ message: "New Sale not found" });
  }

  const sale = await generateReservationBill(newSale);

  if (sale) {
    return res.status(200).json({ message: "Pdf Generated Successfully", sale });
  }
}catch(error){
  console.log('Failed to create bill', error);
  return res.status(500).json({message:"Something went wrong"});
}
};

exports.checkSale = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sale = await Sale.findOne({ productId: productId, userId: userId });

    if (!sale) {
      return res.status(200).json({ message: "Sale Not Found" });
    }

    return res.status(200).json({ message: "Sale has found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
