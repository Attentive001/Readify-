"use client";

import { useState } from "react";

import T from "../../../components/T";
export default function UploadBookPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    authorName: "",
    languageCode: "",
    languageName: "",
    publishedYear: "",
    isbn: "",
    coverUrl: "",
    sourceUrl: "",
    rightsStatus: "public_domain",
    categories: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    setFile(event.target.files?.[0] || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    // Required fields
    const requiredFields = [
      ["title", "Book title"],
      ["description", "Description"],
      ["authorName", "Author name"],
      ["languageCode", "Language code"],
      ["languageName", "Language name"],
      ["publishedYear", "Published year"],
      ["rightsStatus", "Rights status"],
      ["categories", "Categories"],
    ];

    for (const [field, label] of requiredFields) {
      if (!form[field].trim()) {
        setError(`${label} is required.`);
        return;
      }
    }

    if (!file) {
      setError("Please select a book file.");
      return;
    }

    const allowedTypes = [".pdf", ".epub", ".txt"];
    const extension =
      "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(extension)) {
      setError("Only PDF, EPUB, and TXT files are allowed.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      /*
       * File
       */
      formData.append("book", file);

      /*
       * Book information
       */
      formData.append("title", form.title);
      formData.append("description", form.description);

      /*
       * Author information
       */
      formData.append("authorName", form.authorName);

      /*
       * Language information
       */
      formData.append("languageCode", form.languageCode);
      formData.append("languageName", form.languageName);

      /*
       * Publication information
       */
      formData.append("publishedYear", form.publishedYear);
      formData.append("isbn", form.isbn);

      /*
       * URLs
       */
      formData.append("coverUrl", form.coverUrl);
      formData.append("sourceUrl", form.sourceUrl);

      /*
       * Rights
       */
      formData.append("rightsStatus", form.rightsStatus);

      /*
       * Categories
       *
       * Example:
       * Fiction, Classic Literature, Science
       */
      formData.append("categories", form.categories);

      const response = await fetch(
        "http://localhost:4000/api/v1/books/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Book upload failed."
        );
      }

      setMessage(
        "Book uploaded successfully. The original file was saved unchanged."
      );

      // Reset form
      setForm({
        title: "",
        description: "",
        authorName: "",
        languageCode: "",
        languageName: "",
        publishedYear: "",
        isbn: "",
        coverUrl: "",
        sourceUrl: "",
        rightsStatus: "public_domain",
        categories: "",
      });

      setFile(null);

      const fileInput =
        document.getElementById("book-file");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            <T k="readifyAdmin" />
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            <T k="uploadBook" />
          </h1>

          <p className="mt-2 text-gray-600">
            Add complete book information and upload the
            book file. The original PDF, EPUB, or TXT file will be saved unchanged.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          {/* Success */}
          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">

            {/* Title */}
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="bookTitle" /> *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Pride and Prejudice"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="description" /> *
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Write a short description of the book..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Author */}
            <div>
              <label
                htmlFor="authorName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="authorName" /> *
              </label>

              <input
                id="authorName"
                name="authorName"
                type="text"
                value={form.authorName}
                onChange={handleChange}
                placeholder="Example: Jane Austen"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Published year */}
            <div>
              <label
                htmlFor="publishedYear"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="publishedYear" /> *
              </label>

              <input
                id="publishedYear"
                name="publishedYear"
                type="number"
                value={form.publishedYear}
                onChange={handleChange}
                placeholder="Example: 1813"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Language Code */}
            <div>
              <label
                htmlFor="languageCode"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="languageCode" /> *
              </label>

              <input
                id="languageCode"
                name="languageCode"
                type="text"
                value={form.languageCode}
                onChange={handleChange}
                placeholder="Example: en"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Language Name */}
            <div>
              <label
                htmlFor="languageName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="languageName" /> *
              </label>

              <input
                id="languageName"
                name="languageName"
                type="text"
                value={form.languageName}
                onChange={handleChange}
                placeholder="Example: English"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* ISBN */}
            <div>
              <label
                htmlFor="isbn"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                ISBN
              </label>

              <input
                id="isbn"
                name="isbn"
                type="text"
                value={form.isbn}
                onChange={handleChange}
                placeholder="Example: 9781403528804"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Rights */}
            <div>
              <label
                htmlFor="rightsStatus"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="rightsStatus" /> *
              </label>

              <select
                id="rightsStatus"
                name="rightsStatus"
                value={form.rightsStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="public_domain">
                  <T k="publicDomain" />
                </option>

                <option value="open_license">
                  <T k="openLicense" />
                </option>

                <option value="authorized">
                  <T k="authorized" />
                </option>

                <option value="unknown">
                  <T k="unknown" />
                </option>
              </select>
            </div>

            {/* Cover URL */}
            <div>
              <label
                htmlFor="coverUrl"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="coverUrl" />
              </label>

              <input
                id="coverUrl"
                name="coverUrl"
                type="url"
                value={form.coverUrl}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Source URL */}
            <div>
              <label
                htmlFor="sourceUrl"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="sourceUrl" />
              </label>

              <input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                value={form.sourceUrl}
                onChange={handleChange}
                placeholder="https://example.com/book"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

           {/* Categories */}
<div className="md:col-span-2">
  <label
    htmlFor="categories"
    className="mb-2 block text-sm font-semibold text-gray-700"
  >
    Category *
  </label>

  <select
    id="categories"
    name="categories"
    value={form.categories}
    onChange={handleChange}
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
  >
    <option value=""><T k="selectCategory" /></option>

    <option value="Self-Development">
      <T k="catSelfDevelopment" />
    </option>

    <option value="Business">
      <T k="catBusiness" />
    </option>

    <option value="Technology">
      <T k="catTechnology" />
    </option>

    <option value="Science">
      <T k="catScience" />
    </option>

    <option value="History">
      <T k="catHistory" />
    </option>

    <option value="Literature">
      <T k="catLiterature" />
    </option>

    <option value="Philosophy">
      <T k="catPhilosophy" />
    </option>

    <option value="Education">
      <T k="catEducation" />
    </option>

    <option value="Fiction">
      <T k="catFiction" />
    </option>
    
    <option value="Economics">
      <T k="catEconomics" />
    </option>

    <option value="Christian Bible">
      <T k="catChristianBible" />
    </option>
  </select>

  <p className="mt-2 text-xs text-gray-500">
    <T k="categoryHint" />
  </p>
</div>

            {/* Book File */}
            <div className="md:col-span-2">
              <label
                htmlFor="book-file"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                <T k="bookFile" /> *
              </label>

              <input
                id="book-file"
                type="file"
                accept=".pdf,.epub,.txt"
                onChange={handleFileChange}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                Supported formats: PDF, EPUB, TXT. Maximum
                file size: 50MB.
              </p>

              {file && (
                <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">
                    <T k="selectedFile" />
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Upload button */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading Book..." : "Upload Book"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}