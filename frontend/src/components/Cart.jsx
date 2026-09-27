import { useEffect, useState } from 'react'

function Cart() {
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('http://localhost:8080/api/cart/1')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to load cart')
                }

                return response.json()
            })
            .then((data) => {
                setCartItems(data)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Failed to load cart:', error)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <p>Loading cart...</p>
    }

    return (
        <section>
            <h2>Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <p>Your cart is currently empty.</p>
            ) : (
                cartItems.map((item) => (
                    <div key={item.cartItemId}>
                        <h3>{item.product.name}</h3>

                        <p>
                            Quantity: {item.quantity}
                        </p>

                        <p>
                            Unit Price: Rs. {item.unitPrice}
                        </p>

                        <p>
                            Item Total: Rs. {
                            Number(item.unitPrice) * item.quantity
                        }
                        </p>
                    </div>
                ))
            )}
        </section>
    )
}

export default Cart