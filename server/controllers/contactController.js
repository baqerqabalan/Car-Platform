const Contact = require('../models/contactModel');
const { sendEmail } = require('../utils/email');

exports.createContact = async(req, res) => {
    try{
        const { fullName, email, message } = req.body;
        const creatorId = req.user._id;
        const recentMessages = await Contact.findOne({creatorId});
        if(recentMessages){
            return res.status(409).json({message:"You have recently sent a message"})
        }
        const contact = await Contact.create({
            fullName,
            email,
            message,
            creatorId,
            status:'pending'
        });

        if(contact){
            const mailOptions = {
                email: email,
                subject: "Message Sent",
                message: "Your message has sent successfully. Please wait between 3 to 5 days for a reply."
            };
            await sendEmail(mailOptions);
        };

        return res.status(201).json({message: "Message sent successfully"});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
};