import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function BookBus() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [seats, setSeats] = useState([]);
  const [restrictedSeats, setRestrictedSeats] = useState(new Set());
  const [rollNo, setRollNo] = useState("");
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLocation, setAiLocation] = useState("");
  const [aiPreferredTime, setAiPreferredTime] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [stopSearchLoading, setStopSearchLoading] = useState(false);
  const [showStopSuggestions, setShowStopSuggestions] = useState(false);
  const locationInputWrapRef = useRef(null);
  const aiRequestIdRef = useRef(0);
  const navigate = useNavigate();
  const { student, setStudent } = useAuth();
  const studentType = Number(student?.year) === 1 ? "junior" : Number(student?.year) >= 2 ? "senior" : "";

  function formatRouteLabel(route) {
    const via = route?.via ? ` (${route.via})` : "";
    return `${route.route_no} - ${route.route_name}${via}`;
  }

  const authHeaders = useCallback((extra = {}) => {
    const token = localStorage.getItem("token");
    return {
      ...extra,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  function showToast(text, type = "error") {
    setToast({ text, type });
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (locationInputWrapRef.current && !locationInputWrapRef.current.contains(event.target)) {
        setShowStopSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!showAiModal) {
      setStopSuggestions([]);
      setShowStopSuggestions(false);
      return;
    }

    const query = aiLocation.trim();
    if (!query) {
      setStopSuggestions([]);
      setShowStopSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setStopSearchLoading(true);
        const res = await fetch(`/api/stops/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setStopSuggestions(Array.isArray(data) ? data : []);
        setShowStopSuggestions(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      } finally {
        setStopSearchLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [aiLocation, showAiModal]);

  const fetchStudentStatus = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    try {
      setStatusLoading(true);
      const res = await fetch("/api/student/my-status", { headers: authHeaders() });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch student status");
      }

      setRollNo(data.roll_no || student?.roll_no || "");

      const alreadyBooked = Boolean(data.booked ?? data.bus_no);
      setHasExistingBooking(alreadyBooked);

      setStudent((prev) => ({
        ...(prev || {}),
        ...data,
        hasBookedBus: alreadyBooked,
        hasPaidFees: data.payment_status === "Active",
      }));

      if (alreadyBooked) {
        showToast("You already have a booking.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || "Unable to load booking status");
    } finally {
      setStatusLoading(false);
    }
  }, [authHeaders, navigate, setStudent, student?.roll_no]);

  const fetchRoutes = useCallback(async (studentType) => {
    try {
      setLoadingRoutes(true);
      const endpoint = studentType ? `/api/student/routes/${studentType}` : "/api/student/routes";
      const res = await fetch(endpoint, { headers: authHeaders() });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load routes");
      }

      setRoutes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast(error.message || "Unable to load routes");
    } finally {
      setLoadingRoutes(false);
    }
  }, [authHeaders]);

  const handleRouteChange = useCallback((routeNo) => {
    setSelectedRoute(routeNo ? String(routeNo) : null);
  }, []);

  const loadSeatsForRoute = useCallback(async (routeNo) => {
    if (!routeNo) {
      setLoadingSeats(false);
      setSeats([]);
      setRestrictedSeats(new Set());
      return;
    }

    setLoadingSeats(true);
    setSeats([]);
    setRestrictedSeats(new Set());

    try {
      const res = await fetch(`/api/student/seats/${routeNo}`, { headers: authHeaders() });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load seats");
      }

      const seatRows = Array.isArray(data?.seats) ? data.seats : [];
      const apiRestricted = Array.isArray(data?.restrictedSeats) ? data.restrictedSeats : [];

      const seatMap = new Map(
        seatRows.map((seat) => [Number(seat.seat_no), Number(seat.is_booked) === 1])
      );

      const fullGrid = Array.from({ length: 40 }, (_, index) => {
        const seatNo = index + 1;
        return {
          seat_no: seatNo,
          is_booked: seatMap.get(seatNo) ? 1 : 0,
        };
      });

      setSeats(fullGrid);
      setRestrictedSeats(new Set(apiRestricted.map((seat) => Number(seat))));
    } catch (error) {
      console.error(error);
      showToast(error.message || "Unable to load seats");
    } finally {
      setLoadingSeats(false);
    }
  }, [authHeaders]);

  const openAiModal = () => {
    setAiError(null);
    setAiResult(null);
    setStopSuggestions([]);
    setShowStopSuggestions(false);
    setShowAiModal(true);
  };

  const closeAiModal = () => {
    if (aiLoading) return;
    setShowAiModal(false);
    setAiError(null);
    setShowStopSuggestions(false);
  };

  const handleAiRouteSuggestion = async (event) => {
    event.preventDefault();

    const requestId = ++aiRequestIdRef.current;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    if (!aiLocation.trim() || !aiPreferredTime || !studentType) {
      setAiError("Please enter your location and preferred time.");
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/suggest-route", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          location: aiLocation.trim(),
          boarding_time: aiPreferredTime,
          student_type: studentType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to get AI suggestion");
      }

      if (requestId !== aiRequestIdRef.current) {
        return;
      }

      const recommendedRoute = data?.recommended;
      if (recommendedRoute?.id != null) {
        setAiResult(data);
        setShowAiModal(false);
        setShowStopSuggestions(false);

        const routeId = String(recommendedRoute.id);
        console.log("Selected Route:", routeId);
        handleRouteChange(routeId);
      } else {
        setAiError("No routes found near your location");
      }
    } catch (error) {
      if (requestId !== aiRequestIdRef.current) {
        return;
      }
      console.error(error);
      setAiError(error.message || "Unable to get AI suggestion");
    } finally {
      if (requestId === aiRequestIdRef.current) {
        setAiLoading(false);
      }
    }
  };

  const applySuggestedRoute = async (routeId) => {
    const nextRouteId = String(routeId);
    console.log("Selected Route:", nextRouteId);
    handleRouteChange(nextRouteId);
  };

  useEffect(() => {
    fetchStudentStatus().then(() => fetchRoutes(studentType));
  }, [fetchRoutes, fetchStudentStatus, studentType]);

  useEffect(() => {
    loadSeatsForRoute(selectedRoute);
  }, [loadSeatsForRoute, selectedRoute]);

  async function handleConfirmBooking() {
    if (hasExistingBooking) {
      showToast("You already have a booking.");
      return;
    }

    if (!rollNo) {
      showToast("roll_no not found for this account");
      return;
    }

    if (!selectedRoute || !selectedSeat) {
      showToast("Select route and seat before booking");
      return;
    }

    console.log("Selected Route:", selectedRoute);

    try {
      setBookingLoading(true);

      const payload = {
        roll_no: rollNo,
        route_no: Number(selectedRoute),
        seat_no: Number(selectedSeat),
      };

      async function submitBooking(endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        return { response, data };
      }

      let { response: bookRes, data: bookData } = await submitBooking("/api/student/book-bus");

      const looksLikeMissingEndpoint =
        bookRes.status === 404 && String(bookData?.message || "").trim().toLowerCase() === "route not found";

      if (looksLikeMissingEndpoint) {
        const fallback = await submitBooking("/api/student/book");
        bookRes = fallback.response;
        bookData = fallback.data;
      }

      if (!bookRes.ok) {
        if (bookRes.status === 400) {
          const message = bookData.message || "Seat already booked";
          showToast(message);

          if (message === "Adjacent seat restricted due to gender rule" && selectedSeat) {
            alert("Adjacent seat restricted due to gender rule");
            setRestrictedSeats((prev) => {
              const next = new Set(prev);
              next.add(Number(selectedSeat));
              return next;
            });
            setSelectedSeat(null);
            return;
          }

          setHasExistingBooking(bookData.message === "Student already booked");
          await loadSeatsForRoute(selectedRoute);
          return;
        }
        if (bookRes.status === 404) {
          showToast(bookData.message || "Route not found");
          return;
        }
        throw new Error(bookData.message || "Booking failed");
      }

      const statusRes = await fetch("/api/student/my-status", { headers: authHeaders() });
      const statusData = await statusRes.json();

      if (!statusRes.ok) {
        throw new Error(statusData.message || "Failed to refresh student status");
      }

      setStudent((prev) => ({
        ...(prev || {}),
        ...statusData,
        hasBookedBus: Boolean(statusData.booked ?? statusData.bus_no),
        hasPaidFees: statusData.payment_status === "Active",
      }));

      setHasExistingBooking(true);

      const bookingId = bookData.booking_id;
      if (bookingId) {
        navigate(`/payment?booking_id=${bookingId}`, { replace: true });
      } else {
        navigate("/payment", { replace: true });
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || "Unable to complete booking");
    } finally {
      setBookingLoading(false);
    }
  }

  if (statusLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  function renderSeatBox(seat) {
    const seatNo = Number(seat.seat_no);
    const isBooked = Number(seat.is_booked) === 1;
    const isRestricted = restrictedSeats.has(seatNo);
    const isDisabled = isBooked || isRestricted || hasExistingBooking;
    const isSelected = Number(selectedSeat) === seatNo;

    let className = "w-11 h-11 rounded-md text-sm font-semibold border flex items-center justify-center transition ";
    let title = `Seat ${seatNo}`;

    if (isBooked) {
      className += "bg-red-500 text-white border-red-600 cursor-not-allowed";
      title += " (Booked)";
    } else if (isRestricted) {
      className += "bg-amber-500 text-white border-amber-600 cursor-not-allowed";
      title += " (Restricted by adjacent gender rule)";
    } else if (isSelected) {
      className += "bg-blue-500 text-white border-blue-600 cursor-pointer";
    } else {
      className += "bg-green-500 text-white border-green-600 hover:bg-green-600 cursor-pointer";
    }

    return (
      <button
        key={seatNo}
        type="button"
        disabled={isDisabled}
        onClick={() => !isDisabled && setSelectedSeat(seatNo)}
        title={title}
        className={className}
      >
        {seatNo}
      </button>
    );
  }

  const seatRows = [];
  for (let i = 0; i < seats.length; i += 4) {
    seatRows.push(seats.slice(i, i + 4));
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Book Seat</h2>

      {toast && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {toast.text}
        </div>
      )}

      {hasExistingBooking && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium bg-amber-100 text-amber-800">
          Booking is disabled because you already have a seat assigned.
        </div>
      )}

      <div>
        <div className="mb-2">
          <button
            type="button"
            onClick={() => navigate("/routes")}
            className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] ring-1 ring-green-100 transition duration-200 hover:-translate-y-0.5 hover:from-green-700 hover:to-emerald-700 hover:shadow-[0_12px_24px_rgba(5,150,105,0.45)] focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <i className="fas fa-route" aria-hidden="true"></i>
            View All Routes
          </button>
        </div>
        <label className="block text-gray-700 mb-1">Step 1: Select Route</label>
        <select
          value={selectedRoute ?? ""}
          onChange={(e) => handleRouteChange(e.target.value)}
          disabled={loadingRoutes}
          className="border border-gray-300 rounded p-2 w-full md:w-1/2"
        >
          <option value="">{loadingRoutes ? "Loading routes..." : "Choose route"}</option>
          {routes.map((route) => (
            <option key={route.route_no} value={route.route_no}>
              {formatRouteLabel(route)}
            </option>
          ))}
        </select>

        <div className="mt-3 rounded-xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50 via-blue-50 to-emerald-50 px-4 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] ring-1 ring-indigo-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(79,70,229,0.18)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                <i className="fas fa-robot"></i>
              </span>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">✨ Not sure which route to choose?</p>
                  <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    AI Powered
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Let AI suggest the best route based on your location and timing.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAiModal}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition duration-200 hover:scale-105 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg"
            >
              Get AI Suggestion
            </button>
          </div>
        </div>

        {aiLoading ? (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Finding best route...</p>
          </div>
        ) : aiError ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {aiError}
          </div>
        ) : aiResult?.recommended ? (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-green-800">
                Recommended Route: {aiResult.recommended.route_name}
              </p>
              <button
                type="button"
                onClick={() => applySuggestedRoute(aiResult.recommended.id)}
                className="text-sm font-medium text-green-700 underline underline-offset-2"
              >
                Use recommended route
              </button>
            </div>

            {aiResult.explanation && (
              <p className="text-sm text-green-900/80">{aiResult.explanation}</p>
            )}

            {Array.isArray(aiResult.alternatives) && aiResult.alternatives.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {aiResult.alternatives.slice(0, 2).map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => applySuggestedRoute(route.id)}
                    className="rounded-full border border-green-300 bg-white px-3 py-1 text-xs font-semibold text-green-800 transition hover:bg-green-100"
                  >
                    {route.route_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-2">Step 2: Seat Layout (1-40)</h3>

        {loadingSeats && <p className="text-sm text-gray-600">Loading seats...</p>}

        {!loadingSeats && selectedRoute && (
          <>
            <div className="inline-block rounded-xl border-2 border-gray-200 bg-gray-50 p-5">
              <div className="mb-3 text-center text-xs font-semibold text-gray-500">FRONT</div>
              <div className="space-y-2">
                {seatRows.map((row, index) => (
                  <div key={`row-${index}`} className="flex items-center justify-center gap-2">
                    {renderSeatBox(row[0])}
                    {renderSeatBox(row[1])}
                    <div className="w-8 sm:w-10"></div>
                    {renderSeatBox(row[2])}
                    {renderSeatBox(row[3])}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm bg-green-500 border"></span>Available
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm bg-red-500 border"></span>Booked
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm bg-amber-500 border"></span>Restricted
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm bg-blue-500 border"></span>Selected
              </span>
            </div>
          </>
        )}

        {!loadingSeats && !selectedRoute && (
          <p className="text-sm text-gray-500">Select route to load seats.</p>
        )}
      </div>

      <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-700">
          <p>
            Route: <span className="font-semibold">{selectedRoute || "-"}</span>
          </p>
          <p>
            Seat: <span className="font-semibold">{selectedSeat || "-"}</span>
          </p>
        </div>

        <button
          type="button"
          disabled={!selectedRoute || !selectedSeat || bookingLoading || hasExistingBooking}
          onClick={handleConfirmBooking}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-60"
        >
          {bookingLoading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Route Suggestion</h3>
                <p className="mt-1 text-sm text-gray-500">Tell us where you are and when you want to travel.</p>
              </div>
              <button
                type="button"
                onClick={closeAiModal}
                className="rounded-full px-2 py-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close AI route suggestion modal"
              >
                ×
              </button>
            </div>

            {aiLoading ? (
              <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Finding best route...
              </div>
            ) : aiError ? (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {aiError}
              </div>
            ) : aiResult?.recommended ? (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Recommended route found. Use the suggested route on the booking page.
              </div>
            ) : null}

            <form onSubmit={handleAiRouteSuggestion} className="space-y-4">
              <div ref={locationInputWrapRef} className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={aiLocation}
                  onChange={(e) => {
                    setAiLocation(e.target.value);
                    setShowStopSuggestions(true);
                  }}
                  onFocus={() => aiLocation.trim() && setShowStopSuggestions(true)}
                  placeholder="Nagole"
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {showStopSuggestions && (stopSearchLoading || stopSuggestions.length > 0) && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {stopSearchLoading && (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching stops...</div>
                    )}

                    {!stopSearchLoading && stopSuggestions.map((stop) => (
                      <button
                        key={stop}
                        type="button"
                        onClick={() => {
                          setAiLocation(stop);
                          setShowStopSuggestions(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {stop}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Boarding Time</label>
                <input
                  type="time"
                  value={aiPreferredTime}
                  onChange={(e) => setAiPreferredTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">Boarding time means when you reach the stop.</p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-xs text-gray-500">Student type is detected automatically as {studentType || "student"}.</p>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="inline-flex min-w-36 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {aiLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Getting suggestion...
                    </span>
                  ) : (
                    "Get Suggestion"
                  )}
                </button>
              </div>

              {aiLoading && (
                <p className="text-xs text-blue-600">Finding best route...</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
