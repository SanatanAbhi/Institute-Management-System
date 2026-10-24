
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function NavbarMenu() {
    const [menuOpen, setMenuOpen] = useState(false);

    const menus = [
        { id: 1, name: "Home", path: "/" },
        { id: 2, name: "About Us", path: "/about" },
        { id: 3, name: "Courses", path: "/courses" },
        { id: 4, name: "Super Login", path: "/super-admin-login" },
        { id: 5, name: "Events", path: "/events" },
        { id: 6, name: "Downloads", path: "/downloads" },
        { id: 7, name: "Contact Us", path: "/contact" },
    ];

    return (
        <nav className="bg-white shadow-sm py-2">
            <div className="container">
                {/* Mobile menu button */}
                <div className="d-flex justify-content-end d-md-none">
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={menuOpen}
                        aria-controls="main-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span className="fs-5" aria-hidden="true">
                            {menuOpen ? "✕" : "☰"}
                        </span>
                        <span className="ms-2">
                            {menuOpen ? "Close" : "Menu"}
                        </span>
                    </button>
                </div>

                {/* Navigation links */}
                <ul
                    id="main-navigation"
                    className={`nav justify-content-center ${
                        menuOpen ? "d-flex" : "d-none d-md-flex"
                    } flex-column flex-md-row align-items-stretch align-items-md-center`}
                >
                    {menus.map((menu) => (
                        <li className="nav-item text-center" key={menu.id}>
                            <NavLink
                                to={menu.path}
                                end={menu.path === "/"}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `nav-link nav-link-custom ${
                                        isActive ? "active-menu" : ""
                                    }`
                                }
                            >
                                {menu.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
