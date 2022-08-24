import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { showError } from "../utils/common"

import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const BookingList = ({ blockchain }) => {
  // State to store bookings
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    (async () => {
      blockchain.hairdressing && setBookings(await blockchain.hairdressing.getBookings());
    })();
  }, [blockchain]); 

  const getDateFromUnix = (unixDate) => {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds. 
    var date = new Date(unixDate * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    return date;
  }

  return (
    <Container>
      <Row className="my-5">
        <Col md={12}>
          <h3>All Bookings</h3>
        </Col>
        {bookings.map((booking) => (
          <Col md={12} className="mb-3" key={booking.id}>
            <Card>
              <Card.Body>
                <Card.Title>{booking.serviceName.toString()}</Card.Title>
                <Card.Text>{getDateFromUnix(booking.date).toString()}</Card.Text>
                <br></br>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    value={getDateFromUnix(booking.date).toString()}
                    disabled="true"
                  />
                </LocalizationProvider>
                <br></br>
                <Card.Text>{booking.serviceName}</Card.Text>
                <Card.Text>{booking.client}</Card.Text>
                {/*<Link 
                  to={`/booking/${booking.id}`}
                  state={{
                    booking: {
                      ...booking,
                    },
                  }}
                >
                  <Button variant="primary">View</Button>
                </Link>*/}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BookingList;
