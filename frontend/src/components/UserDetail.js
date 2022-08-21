import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

import { useLocation } from "react-router-dom";

const UserDetail = ({ blockchain }) => {
  // State to store auctions
  const [auctions, setAuctions] = useState([]);
  const [offers, setOffers] = useState([]);

  const location = useLocation();

  useEffect(() => { 
    (async () => {
      blockchain.ebay && setAuctions(await blockchain.ebay.getUserAuctions(blockchain.signerAddress));
      blockchain.ebay && setOffers(await blockchain.ebay.getUserOffers(blockchain.signerAddress));
    })();
  }, [blockchain]); 

  return (
    <Container>
      <Container>
        <Row className="my-5">
          <Col md={12}>
            <h3>All User Auctions</h3>
          </Col>
          {auctions.map((auction) => (
            <Col md={12} className="mb-3" key={auction.id}>
              <Card>
                <Card.Body>
                  <Card.Title>{auction.name}</Card.Title>
                  <Card.Text>{auction.description}</Card.Text>
                  {/* Se genera un Link para poder acceder al detalle de la auction al hacer click en ella */ 
                  /* ...auction: Forma de pasar todos los parámetros de auction, salvo los que queramos modificar (debajo) */ }
                  <Link 
                    to={`/auction/${auction.id}`}
                    state={{
                      auction: {
                        ...auction, 
                        minimumOfferPrice: auction.minimumOfferPrice.toString(),
                        auctionEnd: new Date(
                          auction.auctionEnd * 1000
                        ).toString(),
                      },
                    }}
                  >
                    <Button variant="primary">View</Button>
                  </Link>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">
                    Ends On:{" "}
                    <b>{new Date(auction.auctionEnd * 1000).toString()}</b>
                  </small>
                  <br />
                  <small className="text-muted">
                    Posted by: <b>{auction.seller}</b>
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container>
        <Row className="my-5">
          <Col md={12}>
            <h3>All User Offers</h3>
          </Col>
          {offers.map((offer) => (
            <Col md={12} className="mb-3" key={offer.id}>
              <Card>
                <Card.Body>
                  <Card.Title>{offer.auctionId.toString()}</Card.Title>
                  <Card.Text>{offer.buyer}</Card.Text>
                  <Card.Text>{offer.offerPrice.toString()}</Card.Text>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">
                    Posted by: <b>{offer.buyer}</b>
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};

export default UserDetail;
