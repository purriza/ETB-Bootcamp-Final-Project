import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { showError } from "../utils/common"

const ServiceList = ({ blockchain }) => {
  // State to store services
  const [services, setServices] = useState([]);

  useEffect(() => {
    (async () => {
      blockchain.hairdressing && setServices(await blockchain.hairdressing.getServices());
    })();
  }, [blockchain]); 

  return (
    <Container>
      <Row className="my-5">
        <Col md={12}>
          <h3>All Services</h3>
        </Col>
        {services.map((service) => (
          <Col md={12} className="mb-3" key={service.id}>
            <Card>
              <Card.Body>
                <Card.Title>Name: {service.name}</Card.Title>
                <Card.Text>Description: {service.description}</Card.Text>
                <Card.Text>Price: {service.price.toString()}€</Card.Text>
                <Card.Text>Duration: {(service.duration/60).toString()} minutes</Card.Text>
                <Card.Text>Products: 
                   {service.productNames.map((product) => (
                    " " + product.toString()
                  ))}
                  </Card.Text>
                {/*<Link 
                  to={`/service/${service.id}`}
                  state={{
                    service: {
                      ...service,
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

export default ServiceList;
