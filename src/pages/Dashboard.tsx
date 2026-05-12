import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Books</h2>
            <p className="text-sm text-slate-600">
              Manage the book catalog, upload files, and open the Books page from here.
            </p>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <BookOpen className="h-4 w-4" />
            Open Books
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
