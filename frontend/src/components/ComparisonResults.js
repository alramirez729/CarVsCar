import React from 'react';
import SpeedometerGroup from './SpeedometerGroup';
import RenderBarChart from './RenderBarChart';

function ComparisonResults({
  hasCompared,
  nonNumericalComparison,
  comparisonResult,
  overallRating1,
  fuelEfficiency1,
  power1,
  make1,
  overallRating2,
  fuelEfficiency2,
  power2,
  make2,
  viewMode,
  sections,
  activeTab,
  handleNextTab,
  handlePrevTab,
  resultsRef
}) {
  if (!hasCompared) {
    return (
      <p className="my-10 font-sans text-lg italic flex justify-center items-center">
        After selecting both car details, the results will appear below!
      </p>
    );
  }

  return (
    <div id="report-section" className="flex flex-col items-center w-full">
      {viewMode === 'list' ? (
        <>
          {/* Non-Numerical Comparison Box */}
          {nonNumericalComparison && nonNumericalComparison}

          {/* Speedometers */}
          <div className="flex flex-col col-2 sm:col-1 sm:flex-row justify-between gap-12 md:gap-8 sm:gap-4 my-10 items-center">
            <div className="flex flex-col items-center">
              <SpeedometerGroup
                title="Car 1"
                overallRating={overallRating1}
                fuelEfficiency={fuelEfficiency1}
                power={power1}
                make={make1}
                vehicleNumber={1}
              />
            </div>
            <div className="flex flex-col items-center">
              <SpeedometerGroup
                title="Car 2"
                overallRating={overallRating2}
                fuelEfficiency={fuelEfficiency2}
                power={power2}
                make={make2}
                vehicleNumber={2}
              />
            </div>
          </div>

          {/* Metric Comparison Results */}
          <div ref={resultsRef} className="flex flex-wrap justify-center gap-4 w-full">
            {comparisonResult.map((metricComponent, index) => (
              <div key={index} className="w-full sm:w-[48%] lg:w-[32%] max-w-[341px]">
                {metricComponent}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Tabbed View */}
          <div className="w-full flex flex-col items-center">
            <h2 className="my-10 text-2xl font-bold mb-4">{sections[activeTab]}</h2>

            <div className="flex flex-row items-center w-full max-w-4xl">
              {/* Left Arrow */}
              <button onClick={handlePrevTab} className="compare-nav-button ml-4">
                &lt;
              </button>

              {/* Tab Content */}
              <div className="w-full flex justify-center gap-12">
                {activeTab === 0 && (
                  <div className="flex justify-between w-full">
                    <SpeedometerGroup
                      title="Car 1"
                      overallRating={overallRating1}
                      fuelEfficiency={fuelEfficiency1}
                      power={power1}
                      make={make1}
                      vehicleNumber={1}
                    />
                    <SpeedometerGroup
                      title="Car 2"
                      overallRating={overallRating2}
                      fuelEfficiency={fuelEfficiency2}
                      power={power2}
                      make={make2}
                      vehicleNumber={2}
                    />
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
                    {nonNumericalComparison}
                  </div>
                )}

                {activeTab === 2 && (
                  <div className={`grid gap-4 w-full items-center ${
                    comparisonResult.length === 1
                      ? "grid-cols-1 justify-center place-items-center"
                      : "grid-cols-2 lg:grid-cols-2 md:grid-cols-1"
                  }`}>
                    {comparisonResult.map((metricComponent, index) => (
                      <div key={index} className="flex flex-row items-center">
                        {metricComponent}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Arrow */}
              <button onClick={handleNextTab} className="compare-nav-button">
                &gt;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ComparisonResults;
