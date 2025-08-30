import React, { useState, useEffect } from 'react';

const Slider = () => {
    // State to keep track of the current slide
    const [currentSlide, setCurrentSlide] = useState(1);
    const totalSlides = 4; // Total number of slides

    // Add your desired text for each slide
    const slideTexts = {
        1: "Discover the serenity of the mountains.",
        2: "Explore the vastness of the ocean.",
        3: "Find your perfect urban escape.",
        4: "Experience the quiet beauty of a snowy forest."
    };

    // useEffect hook to handle the automatic sliding
    useEffect(() => {
        const interval = setInterval(() => {
            // Cycle through slides: if it's the last slide, go back to the first one, otherwise, move to the next slide
            setCurrentSlide(prevSlide => (prevSlide % totalSlides) + 1);
        }, 5000); // 5000 milliseconds = 5 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="carousel w-full">
                {/* Dynamically render carousel items based on currentSlide state */}
                {[...Array(totalSlides).keys()].map(index => {
                    const slideNumber = index + 1;
                    return (
                        <div
                            key={slideNumber}
                            id={`slide${slideNumber}`}
                            className={`carousel-item relative w-full ${currentSlide === slideNumber ? 'block' : 'hidden'}`}
                        >
                            <img
                                src={`https://img.daisyui.com/images/stock/photo-1${index === 0 ? '625726411847-8cbb60cc71e6' : index === 1 ? '609621838510-5ad474b7d25d' : index === 2 ? '414694762283-acccc27bca85' : '665553365602-b2fb8e5d1707'}.webp`}
                                className="w-full"
                                alt={`Slide ${slideNumber}`}
                            />
                            {/* Overlay for text and navigation */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white  bg-opacity-40 p-4">
                                <h2 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
                                    {slideTexts[slideNumber]}
                                </h2>
                            </div>
                            {/* Navigation buttons */}
                            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                                <button
                                    onClick={() => setCurrentSlide(prev => (prev === 1 ? totalSlides : prev - 1))}
                                    className="btn btn-circle"
                                >
                                    ❮
                                </button>
                                <button
                                    onClick={() => setCurrentSlide(prev => (prev === totalSlides ? 1 : prev + 1))}
                                    className="btn btn-circle"
                                >
                                    ❯
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Slider;