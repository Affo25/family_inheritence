import App from "next/app";
import Link from "next/link";

// Corrected the function declaration by replacing the emoji with parentheses
export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <button className="btn btn-primary me-3">☰</button>
      {/* Corrected the Link component usage */}
      <Link href="/" passHref>
        <a className="navbar-brand">App Name</a>
      </Link>
    </nav>
  );
}
