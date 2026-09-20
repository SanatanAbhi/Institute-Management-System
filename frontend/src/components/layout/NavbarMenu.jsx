import { NavLink, useNavigate } from "react-router-dom";

export default function NavbarMenu() {

    const menus = [
        { id: 1, name: "Home", path: "/" },
        { id: 2, name: "About Us", path: "/about" },
        { id: 3, name: "Courses", path: "/courses" },
        { id: 4, name: "Center Login", path: "/center-login" },
        { id: 5, name: "Super Login", path: "/super-admin-login" },
        { id: 6, name: "Events", path: "/events" },
        { id: 7, name: "Downloads", path: "/downloads" },
        { id: 8, name: "Contact Us", path: "/contact" }
    ];

    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("accessToken");

    function handleLogout() {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        
        navigate("/student-login");
    }

    function handleMenuClick(menu) {
        setActiveMenu(menu.name)

        const section = document.getElementById(menu.id);

        section.scrollIntoView({
            behavior: "smooth"
        });
    }

    return (
        <nav className="bg-white shadow-sm py-2">
            <div className="container">
                <div className="row">
                    <div className="col">
                        <ul className="nav justify-content-center">
                            {
                                menus.map((menu) => {
                                    return (
                                        <li className="nav-item" key={menu.id}>
                                            <NavLink to={menu.path} end={menu.path === "/"} className={({ isActive }) => isActive ? "nav-link nav-link-custom active-menu" : "nav-link nav-link-custom" } > {menu.name} </NavLink>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        {/* Right Side Login / Dashboard */}
                            {
                                !isLoggedIn ? (

                                    <NavLink to="/student-login" className="btn btn-warning" > Student Login </NavLink>

                                    ) : (

                                        <div className="d-flex gap-2">

                                            <NavLink to="/student-dashboard" className="btn btn-success" > Dashboard </NavLink>
                                            <button type="button" className="btn btn-danger" onClick={handleLogout} ><i className="bi bi-box-arrow-right me-2"></i> Logout </button>

                                        </div>

                                        )
                            }
                    </div>
                </div>
            </div>
        </nav>
    )
}

