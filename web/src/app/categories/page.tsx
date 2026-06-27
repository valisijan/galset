import { getCategoriesTreeCached } from "@/lib/categories"
import MarketplaceClient from "./CategoriesClient"

export default async function MarketplacePage() {
  const initialCategories = await getCategoriesTreeCached()

  return <MarketplaceClient initialCategories={initialCategories} />
}

