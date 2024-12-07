import CartModel from "../../models/cartModel.js";
import ProductModel from "../../models/productModel.js";

const addToCart = async (req, res) => {
    try {

        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || quantity <= 0) {
            return res.json({
                success: false,
                message: 'Invalid data provided!'
            })
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.json({
                success: false,
                message: 'Product not found'
            })
        }

        let cart = await CartModel.findOne({ userId });

        if (!cart) {
            cart = new CartModel({ userId, items: [] })
        }
        const findProductIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (findProductIndex === -1) {
            cart.items.push({ productId, quantity })
        } else {
            cart.items[findProductIndex].quantity += quantity
        }

        await cart.save()

        res.json({
            success: true,
            data: cart
        })

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

const fetchCartItems = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.json({
                success: false,
                message: 'User not found'
            })
        }
        const cart = await CartModel.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'image title price salePrice'
        })

        if (!cart) {
            if (!userId) {
                return res.json({
                    success: false,
                    message: 'Cart not found'
                })
            }
        }

        const validItems = cart.items.filter(item => item.productId)

        if (validItems.length < cart.items.length) {
            cart.items = validItems
            await cart.save()
        }

        const populateCartItems = validItems.map(item => ({
            productId: item.productId._id,
            image: item.productId.image,
            title: item.productId.title,
            price: item.productId.price,
            salePrice: item.productId.salePrice,
            quantity: item.quantity
        }))

        res.json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems
            }
        })




    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

const updateCartItems = async (req, res) => {
    try {

        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || quantity <= 0) {
            return res.json({
                success: false,
                message: 'Invalid data provided!'
            })
        }

        const cart = await CartModel.findOne({ userId });
        if (!cart) {
            return res.json({
                success: false,
                message: "Cart not found!",
            });
        }

        const findProductIndex = cart.items.findIndex(item => item.productId.toString() === productId)
        if (findProductIndex === -1) {
            return res.json({
                success: false,
                message: 'Cart item not present'
            })
        }
        cart.items[findProductIndex].quantity = quantity;
        await cart.save();

        await cart.populate({
            path: 'items.productId',
            select: 'image title price salePrice'
        })

        const populateCartItems = cart.items.map(item => ({
            productId: item.productId ? item.productId._id : null,
            image: item.productId ? item.productId.image : null,
            title: item.productId ? item.productId.title : "Product not found",
            price: item.productId ? item.productId.price : null,
            salePrice: item.productId ? item.productId.salePrice : null,
            quantity: item.quantity,
        }))

        res.json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems
            }
        })

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

const removeCartItems = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Invalid data provided!",
            });
        }

        const cart = await CartModel.findOne({ userId }).populate({
            path: "items.productId",
            select: "image title price salePrice",
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found!",
            });
        }

        cart.items = cart.items.filter(
            (item) => item.productId._id.toString() !== productId
        );

        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "image title price salePrice",
        });

        const populateCartItems = cart.items.map((item) => ({
            productId: item.productId ? item.productId._id : null,
            image: item.productId ? item.productId.image : null,
            title: item.productId ? item.productId.title : "Product not found",
            price: item.productId ? item.productId.price : null,
            salePrice: item.productId ? item.productId.salePrice : null,
            quantity: item.quantity,
        }));

        res.status(200).json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

export { addToCart, fetchCartItems, updateCartItems, removeCartItems }