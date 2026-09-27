import CategoryList from "./components/CategoryList";



function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="text-xl font-bold tracking-tight text-slate-900">
            MUSTAFA HARDWARE{" "}
            <span className="font-extrabold text-orange-600">
              SHOP
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm font-semibold">
            <a
              href="#products"
              className="text-slate-600 hover:text-orange-600"
            >
              Products
            </a>

            <a
              href="#management"
              className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-orange-600"
            >
              Management
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="rounded-xl bg-slate-900 px-8 py-14 text-white shadow-lg">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-500">
            Member 1 Component
          </p>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight">
            Product and Category Management
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Manage the Mustafa Hardware product catalogue and
            organize products using categories.
          </p>
        </section>

        <section
          id="management"
          className="mt-10 grid gap-6 md:grid-cols-2"
        >
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-600">
              P
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Product Management
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create, view, update and delete products.
            </p>

            <button className="mt-6 rounded-md bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
              Manage Products
            </button>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-600">
              C
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Category Management
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create, view, update and delete categories.
            </p>

            <button className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
              Manage Categories
            </button>
          </article>
        </section>
        <CategoryList />
      </main>
    </div>
  );
}

export default App;