const Message = require('../../../server/models/contactModel');
const { sendEmail } = require('../utils/sendEmail');


exports.getPendingMessages = async(req, res) => {
    try{
        const messages = await Message.find({status:"pending"}).populate("creatorId", "firstName lastName profileImg");
        const total = await Message.countDocuments({status:"pending"});

        return res.status(200).json({messages, total});
        
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.getResolvedMessages = async(req, res) => {
    try{
        const messages = await Message.find({status:"resolved"}).populate("creatorId", "firstName lastName profileImg");

        return res.status(200).json({messages});
        
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { email, reply } = req.body;

        // Validate required fields
        if (!email || !reply) {
            return res.status(400).json({
                message: "Both email and reply fields are required.",
            });
        }

        // Fetch the pending message for the provided email
        const contactMsg = await Message.findOne({ status: "pending", email }).populate("creatorId", "firstName lastName");

        // Validate if the message exists
        if (!contactMsg) {
            return res.status(404).json({ message: "No pending message found for the provided email." });
        }

        // Handle missing creatorId gracefully
        const firstName = contactMsg.creatorId?.firstName || "Sir/Madam";
        const lastName = contactMsg.creatorId?.lastName || "";

        // Email options
        const mailOptions = {
            email: email,
            subject: "Replying to Your Message",
            message: `Dear ${firstName} ${lastName},\n\nThank you for reaching out to us. We have reviewed your message and would like to provide the following response:\n\n${reply}\n\nIf you have any further questions or concerns, please do not hesitate to contact us.\n\nBest regards,\nThe Support Team`,
        };

        // Send the email
        await sendEmail(mailOptions);

        // Update message status
        contactMsg.status = "resolved";
        contactMsg.reply = reply;
        await contactMsg.save();

        return res.status(200).json({
            message: "Message sent successfully and status updated.",
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            message: "Something went wrong while sending the message. Please try again later.",
        });
    }
};

exports.getTotalMessages = async(req, res) => {
    try{
        const total = await Message.countDocuments({status:"pending"});

        return res.status(200).json({total});
    }catch(error){
        console.error("Error fetching total messages:", error);
        return res.status(500).json({message:"Something went wrong"});
    }
};
