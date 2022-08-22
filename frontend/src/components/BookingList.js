import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { showError } from "../utils/common"

const BookingList = ({ blockchain }) => {
  // State to store bookings
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    (async () => {
      blockchain.hairdressing && setBookings(await blockchain.hairdressing.getBookings());
    })();
  }, [blockchain]); 

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
                <Card.Title>{booking.serviceId.toString()}</Card.Title>
                <Card.Text>{booking.date}</Card.Text>
                <Card.Text>{booking.client}</Card.Text>
                <Link 
                  to={`/booking/${booking.id}`}
                  state={{
                    booking: {
                      ...booking,
                    },
                  }}
                >
                  <Button variant="primary">View</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BookingList;
