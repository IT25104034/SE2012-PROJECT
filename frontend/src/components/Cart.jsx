import { useState } from 'react'

function Cart() {
    const [cartItems, setCartItems] = useState([])

    return (
        <section>
            <h2>Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <p>Your cart is currently empty.</p>
            ) : (
                cartItems.map((item) => (
                    <div key={item.cartItemId}>
                        <h3>{item.product.name}</h3>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: Rs. {item.product.price}</p>
                    </div>
                ))
            )}
        </section>
    )
}

export default Cart