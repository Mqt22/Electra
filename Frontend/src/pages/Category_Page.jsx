import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/categories";

const emptyForm = {
name: "",
color: "",
size: "",
category_type: "",
};

const Category_Page = () => {
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);

const [showModal, setShowModal] = useState(false);
const [modalMode, setModalMode] = useState("add");

const [selectedCategory, setSelectedCategory] = useState(null);
const [formData, setFormData] = useState(emptyForm);

const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

// --------------------------------
// GET CATEGORIES
// --------------------------------
const fetchCategories = async () => {
try {
setLoading(true);
setError("");
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();
  setCategories(data);
} catch (err) {
  console.error(err);
  setError("Failed to load categories.");
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchCategories();
}, []);

// --------------------------------
// OPEN ADD MODAL
// --------------------------------
const handleAdd = () => {
setModalMode("add");
setSelectedCategory(null);
setFormData(emptyForm);
setError("");
setShowModal(true);
};

// --------------------------------
// OPEN EDIT MODAL
// --------------------------------
const handleEdit = (category) => {
setModalMode("edit");
setSelectedCategory(category);

setFormData({
  name: category.name || "",
  color: category.color || "",
  size: category.size || "",
  category_type: category.category_type || "",
});

setError("");
setShowModal(true);

};

// --------------------------------
// CLOSE MODAL
// --------------------------------
const handleCloseModal = () => {
if (saving) return;

setShowModal(false);
setSelectedCategory(null);
setFormData(emptyForm);
setError("");

};

// --------------------------------
// FORM CHANGE
// --------------------------------
const handleChange = (e) => {
const { name, value } = e.target;

setFormData((prev) => ({
  ...prev,
  [name]: value,
}));

};

// --------------------------------
// SAVE / CREATE CATEGORY
// --------------------------------
const handleSubmit = async (e) => {
e.preventDefault();


if (!formData.name.trim()) {
  setError("Category name is required.");
  return;
}

try {
  setSaving(true);
  setError("");

  const isEdit = modalMode === "edit";

  const url = isEdit
    ? `${API_URL}/${selectedCategory.id}`
    : API_URL;

  const method = isEdit ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong.");
  }

  await fetchCategories();

  handleCloseModal();
} catch (err) {
  console.error(err);
  setError(err.message || "Failed to save category.");
} finally {
  setSaving(false);
}


};

// --------------------------------
// DELETE CATEGORY
// --------------------------------
const handleDelete = async (category) => {
const confirmed = window.confirm(
`Are you sure you want to delete "${category.name}"?`
);


if (!confirmed) return;

try {
  const response = await fetch(`${API_URL}/${category.id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to delete category.");
  }

  setCategories((prev) =>
    prev.filter((item) => item.id !== category.id)
  );
} catch (err) {
  console.error(err);
  window.alert(err.message || "Failed to delete category.");
}


};

return ( <div className="min-h-screen bg-slate-50 p-6">


  {/* PAGE HEADER */}
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-12">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Categories
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Manage your product categories
      </p>
    </div>

    <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
    >
      <span className="text-lg leading-none">+</span>
      Add Category
    </button>
  </div>

  {/* ERROR */}
  {error && !showModal && (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {error}
    </div>
  )}

  {/* TABLE CARD */}
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

    {/* TABLE */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-255 border-collapse">

        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category ID
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category Name
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Color
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Size
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category Type
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Products
            </th>

            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody>

          {/* LOADING */}
          {loading ? (
            <tr>
              <td
                colSpan="7"
                className="px-5 py-12 text-center text-sm text-slate-500"
              >
                Loading categories...
              </td>
            </tr>
          ) : categories.length === 0 ? (

            /* EMPTY */
            <tr>
              <td
                colSpan="7"
                className="px-5 py-12 text-center"
              >
                <div className="text-sm font-medium text-slate-600">
                  No categories found
                </div>

                <button
                  onClick={handleAdd}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Add your first category
                </button>
              </td>
            </tr>

          ) : (

            /* CATEGORY ROWS */
            categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
              >

                {/* ID */}
                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  #{category.id}
                </td>

                {/* NAME */}
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">
                    {category.name}
                  </div>
                </td>

                {/* COLOR */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">

                    {category.color && (
                      <span
                        className="h-4 w-4 rounded-full border border-slate-200"
                        style={{
                          backgroundColor: category.color,
                        }}
                      />
                    )}

                    <span className="text-sm text-slate-600">
                      {category.color || "—"}
                    </span>
                  </div>
                </td>

                {/* SIZE */}
                <td className="px-5 py-4 text-sm text-slate-600">
                  {category.size || "—"}
                </td>

                {/* TYPE */}
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {category.category_type || "—"}
                  </span>
                </td>

                {/* PRODUCTS */}
                <td className="px-5 py-4 text-sm text-slate-600">
                  —
                </td>

                {/* ACTIONS */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => handleEdit(category)}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(category)}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>

                    <button
                      onClick={handleAdd}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                    >
                      Add
                    </button>

                  </div>
                </td>

              </tr>
            ))

          )}

        </tbody>
      </table>
    </div>
  </div>

  {/* =========================================
      MODAL OVERLAY
  ========================================= */}
  {showModal && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >

      {/* MODAL */}
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {modalMode === "edit"
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {modalMode === "edit"
                ? "Update category information"
                : "Create a new product category"}
            </p>
          </div>

          {/* CROSS BUTTON */}
          <button
            onClick={handleCloseModal}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          <div className="space-y-5 px-6 py-6">

            {/* MODAL ERROR */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* CATEGORY NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Phones"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* COLOR */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Color
              </label>

              <div className="flex gap-3">

                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Blue"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  type="color"
                  value={
                    formData.color &&
                    /^#[0-9A-F]{6}$/i.test(formData.color)
                      ? formData.color
                      : "#2563eb"
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                />

              </div>
            </div>

            {/* SIZE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Size
              </label>

              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g. Medium"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* CATEGORY TYPE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category Type
              </label>

              <select
                name="category_type"
                value={formData.category_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select category type</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Home">Home</option>
                <option value="Gaming">Gaming</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          {/* MODAL FOOTER */}
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

            <button
              type="button"
              onClick={handleCloseModal}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : modalMode === "edit"
                ? "Save Changes"
                : "Add Category"}
            </button>

          </div>

        </form>
      </div>
    </div>
  )}

</div>

);
};

export default Category_Page;