import OfficialDocumentsClient from './OfficialDocumentsClient';
import {
  fetchOfficialDocumentCategoriesServer,
  fetchOfficialDocumentYearBundlesServer,
  fetchTenantOfficialDocumentsServer,
} from './ApiServerActions';

export const dynamic = 'force-dynamic';

export default async function OfficialDocumentsPage() {
  const [categoryResult, documents, initialBundles] = await Promise.all([
    fetchOfficialDocumentCategoriesServer(),
    fetchTenantOfficialDocumentsServer(),
    fetchOfficialDocumentYearBundlesServer(),
  ]);

  return (
    <OfficialDocumentsClient
      initialCategories={categoryResult.categories}
      categorySource={categoryResult.source}
      categoryMessage={categoryResult.message}
      initialDocuments={documents}
      initialBundles={initialBundles}
    />
  );
}
