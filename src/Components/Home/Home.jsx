import Hero1 from '../../Pages/HeroSection/Hero1/Hero1';
import TrustBrand from '../../Pages/HeroSection/TrustedBrand/TrustBrand';
import Why from '../../Pages/HeroSection/Why/Why';
import Hero2 from '../../Pages/HeroSection/Hero1/Hero2';
import App from '../../Pages/Faq/app';
import App2 from '../../Pages/Faq/App2';

const Home = () => {
    return (
        <div>
            {/* Main Hero Section */}
            <Hero1 />

            {/* Trusted By Brands */}
            <TrustBrand />

            {/* Why Choose Us */}
            <Why />

            {/* Stats & Growth Section */}
            <Hero2 />

            {/* Extra Resources / Secondary FAQ */}
            <App2 />
            {/* FAQ / Help Section */}
            <App />
        </div>
    );
};

export default Home;
