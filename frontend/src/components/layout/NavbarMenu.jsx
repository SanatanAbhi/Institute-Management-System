import { NavLink } from "react-router-dom";

export default function NavbarMenu() {
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
                <ul className="nav justify-content-center flex-wrap">
                    {menus.map((menu) => (
                        <li className="nav-item" key={menu.id}>
                            <NavLink
                                to={menu.path}
                                end={menu.path === "/"}
                                className={({ isActive }) =>
                                    isActive
                                        ? "nav-link nav-link-custom active-menu"
                                        : "nav-link nav-link-custom"
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