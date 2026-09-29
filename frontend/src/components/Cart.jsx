import { useEffect, useState } from 'react'
import {
    checkoutCart,
    getCart,
    removeCartItem,
    updateCartQuantity,
} from '../services/cartService.js'
import { useAuth } from '../auth/authContext.js'

function Cart() {
    const { user } = useAuth()
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [checkoutMessage, setCheckoutMessage] = useState('')

    const userId = user.id

    const loadCart = () => {
        setLoading(true)
        setError('')

        getCart(userId)
            .then((data) => {
                setCart(data)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Failed to load cart:', error)
                setError('Unable to load your cart.')
                setLoading(false)
            })
    }

    useEffect(() => {
        let active = true

        getCart(userId)
            .then((data) => {
                if (active) {
                    setCart(data)
                    setLoading(false)
                }
            })
            .catch((error) => {
                console.error('Failed to load cart:', error)
                if (active) {
                    setError(error.response?.data?.message || 'Unable to load your cart.')
                    setLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [userId])

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            return
        }

        updateCartQuantity({ userId, productId, quantity })
            .then(() => {
                loadCart()
            })
            .catch((error) => {
                console.error('Failed to update quantity:', error)
                setError(error.response?.data?.message || 'Unable to update item quantity.')
            })
    }

    const removeItem = (productId) => {
        removeCartItem({ userId, productId })
            .then(() => {
                loadCart()
            })
            .catch((error) => {
                console.error('Failed to remove item:', error)
                setError('Unable to remove item from cart.')
            })
    }

    const checkout = () => {
        setCheckoutMessage('')
        setError('')

        checkoutCart(userId)
            .then((order) => {
                setCheckoutMessage(
                    `Order #${order.orderId} created successfully.`
                )
                loadCart()
            })
            .catch((error) => {
                console.error('Checkout failed:', error)
                setError(error.response?.data?.message || 'Unable to complete checkout.')
            })
    }

    if (loading) {
        return (
            <section className="mt-10 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm text-slate-500">Loading cart...</p>
            </section>
        )
    }

    if (error && !cart) {
        return (
            <section className="mt-10 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                <p className="font-semibold text-red-600">{error}</p>
            </section>
        )
    }

    const items = cart?.items ?? []

    return (
        <section
            id="cart"
            className="mt-10"
        >
            <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                    Member 2 Component
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    Shopping Cart
                </h2>

                <p className="mt-2 text-slate-500">
                    Review your selected hardware items before checkout.
                </p>
            </div>

            {checkoutMessage && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
                    {checkoutMessage}
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                    {error}
                </div>
            )}

            {items.length === 0 ? (
                <article className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-600">
                        C
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                        Your cart is empty
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Add products to your cart to continue shopping.
                    </p>
                </article>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-bold text-slate-900">
                                Cart Items
                            </h3>
                        </div>

                        <div>
                            {items.map((item) => {
                                const itemTotal =
                                    Number(item.unitPrice) * item.quantity

                                return (
                                    <div
                                        key={item.cartItemId}
                                        className="border-b border-slate-200 px-6 py-5 last:border-b-0"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900">
                                                    {item.productName}
                                                </h4>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Unit Price: Rs.{' '}
                                                    {Number(
                                                        item.unitPrice
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center rounded-md border border-slate-200">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productId,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity <= 1
                                                        }
                                                        className="px-3 py-2 font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        −
                                                    </button>

                                                    <span className="min-w-10 px-2 text-center text-sm font-bold text-slate-900">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productId,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        className="px-3 py-2 font-bold text-slate-700 hover:bg-slate-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <p className="min-w-28 text-right font-bold text-slate-900">
                                                    Rs.{' '}
                                                    {itemTotal.toFixed(2)}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.productId
                                                        )
                                                    }
                                                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </article>

                    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900">
                            Order Summary
                        </h3>

                        <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-4">
                            <span className="text-sm text-slate-500">
                                Items
                            </span>

                            <span className="text-sm font-semibold text-slate-900">
                                {items.length}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                                Total
                            </span>

                            <span className="text-xl font-extrabold text-orange-600">
                                Rs.{' '}
                                {Number(cart?.totalAmount ?? 0).toFixed(2)}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={checkout}
                            className="mt-6 w-full rounded-md bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700"
                        >
                            Proceed to Checkout
                        </button>
                    </aside>
                </div>
            )}
        </section>
    )
}

export default Cart
