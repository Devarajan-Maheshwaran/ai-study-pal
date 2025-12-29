import { Link } from "react-router-dom";
const NotFound = () => {
  return (<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"><h2 className="text-2xl font-semibold text-text">Page not found</h2><p className="max-w-md text-sm text-muted">The page you are looking for does not exist. Check the URL or head back to your dashboard.</p><Link to="/" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Go to dashboard</Link></div>);
};
export default NotFound;