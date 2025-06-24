export default function Footer() {
  return (
    <footer className="bg-slate-900 shadow-md p-4 text-center">
      &copy; {new Date().getFullYear()} Weight Tracker
    </footer>
  );
}