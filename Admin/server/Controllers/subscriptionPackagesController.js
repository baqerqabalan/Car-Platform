const SubscriptionPackages = require('../../../server/models/subscriptionPackagesModel');

// Create a new subscription package
exports.createSubscriptionPackage = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        // Create and save the subscription package
        const package = await SubscriptionPackages.create({
            title,
            description,
            price
        });

        return res.status(201).json({
            message: "Subscription Package Created Successfully",
            data: package
        });
    } catch (error) {
        console.error('Error creating package:', error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


// Update a package
exports.updateSubscriptionPackage = async (req, res) => {
    try {
        const packageId = req.params.packageId;
        const {title, description, price} = req.body;

        const package = await SubscriptionPackages.findById(packageId);
        if (!package) {
            return res.status(404).json({ message: "Package Not Found" });
        }

        // Update the discussion title if provided
        if (title) package.title = title;
        if (description) package.description= description;
        if (price) package.price = price;

        const updatedPackage = await package.save();

        return res.status(200).json({ message: "Package Updated Successfully", data: updatedPackage });
    } catch (error) {
        console.error('Error updating package:', error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Delete a discussion
exports.deleteSubscriptionPackage = async (req, res) => {
    try {
        const packageId = req.params.packageId;

        const package = await SubscriptionPackages.findById(packageId);
        if (!package) {
            return res.status(404).json({ message: "Package Not Found" });
        }

        await package.deleteOne();

        return res.status(200).json({ message: "Package deleted successfully" });
    } catch (error) {
        console.error('Error deleting package:', error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getSubscriptionPackages = async(req, res) => {
    try{
        const packages = await SubscriptionPackages.find();

        if(!packages){
            return res.status(404).json({message: "No packages found"})
        }

        return res.status(200).json({ packages });
    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Something went wrong"});
    }
}