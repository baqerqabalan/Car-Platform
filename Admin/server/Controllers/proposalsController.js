const Proposal = require('../../../server/models/requestSubscriptionModel');
const User = require('../../../server/models/userModel');
const Subscription = require('../../../server/models/subscriptionPackagesModel');

exports.getMechanicProposals = async (req, res) => {
    try {
        const { tabValue, page = 1, limit = 3 } = req.query; // Default to page 1 and 3 proposals per page
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        let cond;

        // Determine the condition based on the tab value
        if (tabValue == 0) {
            cond = { status: 'approved' };
        } else if (tabValue == 1) {
            cond = { status: 'disapproved' };
        } else if (tabValue == 2) {
            cond = { status: 'pending' };
        } else {
            return res.status(400).json({ message: "Invalid proposal status selected" });
        }

        // Fetch proposals with pagination
        const proposals = await Proposal.find(cond)
            .skip((parsedPage - 1) * parsedLimit) // Correct skip calculation
            .limit(parsedLimit);  // Limit to the specified number of proposals per page

        // Prepare an array of promises to fetch users and subscription packages for each proposal
        const proposalDetails = await Promise.all(
            proposals.map(async (proposal) => {
                const user = await User.findById(proposal.requestedClientId);
                const subscriptionPackage = await Subscription.findById(proposal.subscription).select('title');

                return {
                    proposal,
                    user,
                    subscriptionPackage
                };
            })
        );

        // Count total proposals based on the condition for pagination
        const totalProposals = await Proposal.countDocuments(cond);

        // Calculate total pages
        const totalPages = Math.ceil(totalProposals / parsedLimit);

        // Send the detailed response with proposals, users, and packages
        return res.status(200).json({
            proposals: proposalDetails,
            totalPages: totalPages,  // Send total pages along with proposals
        });
        
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getTotalRequests = async(req, res) => {
    try{
        const total = await Proposal.countDocuments({ status: 'pending' });

        return res.status(200).json({ total });
    }catch(error){
        console.error('Error: ', error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

exports.updateStatus = async (req, res) => {
    try {
        const { proposalId, status } = req.body; // Destructure proposalId and status from req.body
        const recieptImg = req.file ? req.file.path : null; // Get the image path from req.file

        // Find the proposal by its ID
        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({ message: "Proposal Not Found" });
        }

        // Handle different status updates
        if (status === "approved") {
            if (!recieptImg) {
                return res.status(400).json({ message: "Please upload a receipt image" });
            }

            // Update the proposal's status and receipt image
            proposal.recieptImg = recieptImg;
            proposal.status = 'approved';
        } else if (status === 'disapproved') {
            proposal.status = 'disapproved';
        } else {
            return res.status(404).json({ message: "Status not defined" });
        }

        // Save the updated proposal
        await proposal.save();

        return res.status(200).json({ message: "Status Updated Successfully" });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
