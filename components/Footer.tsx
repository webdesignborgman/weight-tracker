export default function Footer() {
  return (
    <footer className="bg-gray-100 p-4 text-center">
      &copy; {new Date().getFullYear()} Weight Tracker
    </footer>
  );
}