import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { showError } from "../utils/common"

const ProductList = ({ blockchain }) => {
  // State to store products
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      blockchain.ebay && setProducts(await blockchain.hairdressing.getProducts());
    })();
  }, [blockchain]); 

  return (
    <Container>
      <Row className="my-5">
        <Col md={12}>
          <h3>All Products</h3>
        </Col>
        {auctions.map((auction) => (
          <Col md={12} className="mb-3" key={auction.id}>
            <Card>
              <Card.Body>
                <Card.Title>{auction.name}</Card.Title>
                <Card.Text>{auction.description}</Card.Text>
                <Link 
                  to={`/product/${product.id}`}
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
  );
};

export default AuctionList;
