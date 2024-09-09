import { Link, useNavigate } from "react-router-dom";
import "./SeatSelection.css";
import { Seat } from "../../components/Passenger/Seat";
import { SeatsRow } from "../../components/Passenger/SeatsRow";
import { useEffect, useState } from "react";
import { seatRows } from "./seats";
import {
  BackButton,
  PageTitle,
  PrimaryButton,
} from "../../components/Passenger/common";
import { useTranslation } from "react-i18next";

export const SeatSelection = () => {
  const [seat, setSeat] = useState(JSON.parse(localStorage.getItem("seat")));
  const navigate = useNavigate();

  const { t } = useTranslation();

  const dark = localStorage.getItem("dark") == "true";

  const passenger = localStorage.getItem("passenger");
  const bookingCode = localStorage.getItem("bookingCode");

  const saveSeat = (e) => {
    e.preventDefault();
    if (seat !== null) {
      let price = 20;
      if (seat.isVIP) price = 50;
      if (seat.save) price = 12;
      localStorage.setItem("seat-price", price);
      localStorage.setItem("seat", JSON.stringify(seat));
      navigate("/check_in/summary");
    }
  };

  const skipSeat = () => {
    localStorage.setItem("seat-price", 0);
    localStorage.setItem("seat", null);
  };

  useEffect(() => {
    document.title = t("Checkin.Seat.Title");
  }, []);

  const skipSeatButtonClassName = dark
    ? "text-green-600 text-sm"
    : "text-white text-center block bg-gray-700 hover:grey-800 rounded w-full p-2";

  return (
    <>
      <PageTitle>{t("Checkin.Seat.Title")}</PageTitle>
      <div className="flex flex-row mx-auto">
        <div className="w-1/4 pl-20 pt-20">
          {`${t("Checkin.Seat.ReservationInfo")} ${bookingCode || ""}`}
          <h3 className="font-bold text-lg mt-5">
            {t("Checkin.Seat.Passengers")}
          </h3>
          <p>{passenger || "James Ferrel"}</p>
          <h3 className="font-bold text-lg mt-5">
            {t("Checkin.Seat.Flights")}
          </h3>
          <p className="mt-3 font-bold">Madrid -&gt; Barcelona</p>
          {t("Checkin.Seat.ReservationDate1")}
          <br />
          <small>× {t("Checkin.Seat.SmallBag")} (40cm × 20cm)</small>
          <br />
          <p className="mt-3 font-bold">Barcelona -&gt; Madrid</p>
          {t("Checkin.Seat.ReservationDate2")}
          <br />
          <small>× {t("Checkin.Seat.SmallBag")} (40cm × 20cm)</small>
          <br />
        </div>
        <div className="w-3/4">
          <form id="seatSelection" onSubmit={saveSeat}>
            <div className="flex">
              <div className="plane">
                <div className="exit exit--front fuselage"></div>
                <div className="cabin fuselage">
                  {seatRows.map((row, i) => (
                    <SeatsRow
                      key={i}
                      number={i + 1}
                      isVIP={row.isVIP}
                      seats={row.seats}
                      onSelect={setSeat}
                      selected={seat}
                    />
                  ))}
                </div>
                <div className="exit exit--back fuselage"></div>
              </div>
              <div className="legend w-2/3">
                <h2 className="font-bold text-2xl text-gray-700">
                  {t("Checkin.Seat.Title")}
                </h2>
                <dl>
                  <dt>
                    <Seat value={"NN"} isVIP={true} />
                  </dt>
                  <dd>
                    {t("Checkin.Seat.Preferential")} <strong>(+ USD 50)</strong>
                  </dd>
                  <dt>
                    <Seat value={"NN"} isVIP={false} />
                  </dt>
                  <dd>
                    {t("Checkin.Seat.Regular")} <strong>(+ USD 20)</strong>
                  </dd>
                  <dt>
                    <Seat value={"NN"} isVIP={false} save={true} />
                  </dt>
                  <dd>
                    {t("Checkin.Seat.Cheap")} <strong>(+ USD 12)</strong>
                  </dd>
                  <dt>
                    <div className="seat reference">
                      <input
                        type="radio"
                        name="seat"
                        disabled
                        id="10F"
                        value="10F"
                      />
                      <label htmlFor="10F">NN</label>
                    </div>
                  </dt>
                  <dd>{t("Checkin.Seat.Occupied")}</dd>
                </dl>
                
                <div className="my-6 mt-20 flex buttons justify-around items-center p-2">
                  <div className="w-1/2 skip">
                    <Link
                    to="/check_in/summary"
                    className={skipSeatButtonClassName}
                    onClick={skipSeat}
                    >
                    {t("Checkin.Seat.NoSeat")}
                    </Link>
                  </div>
                  <div className="w-1/3">
                    <PrimaryButton
                    type={"submit"}
                    className="disabled:cursor-not-allowed"
                    disabled={seat === null}
                    >
                    {t("Checkin.Seat.Continue")}
                    </PrimaryButton>
                  </div>
                </div>
                
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};
