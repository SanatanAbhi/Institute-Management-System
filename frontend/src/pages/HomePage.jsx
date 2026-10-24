import Header from "../components/layout/Header";
import HeroSection from "../components/layout/HeroSection";
import NavbarMenu from "../components/layout/NavbarMenu";
import PopularCourses from "../components/layout/PopularCourses";
import WhyChooseSection from "../components/layout/WhyChooseSection";
import Footer from "../components/layout/Footer";

import Centers from "./Centers";
import GovernmentPartners from "./GovernmentPartners";
import SuccessStories from "./SuccessStories";
import EventsSection from "./EventsSection";
import GallerySection from "./GallerySection";
import DownloadsSection from "./DownloadsSection";
import PublicCenters from "./PublicCenters";

export default function HomePage() {

    return (
        <>

            <Header />
            <NavbarMenu />

            <HeroSection />

            <PopularCourses />
            <WhyChooseSection />
            <PublicCenters />
            <GovernmentPartners />

            <SuccessStories />
            <EventsSection />
            <GallerySection />
            <DownloadsSection />

            <Footer />

        </>
    );

}