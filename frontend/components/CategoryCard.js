export default function CategoryCard({ category }) {
  return (
    <a href={`/categories/${category.slug}`} className="p-4 border rounded-md block">
      <div className="font-display font-semibold">{category.name}</div>
      <div className="text-xs text-neutral-500">{category.book_count} books</div>
    </a>
  );
}
