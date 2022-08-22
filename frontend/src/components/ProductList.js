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
      blockchain.hairdressing && setProducts(await blockchain.hairdressing.getProducts());
    })();
  }, [blockchain]); 

  return (
    <Container>
      <Row className="my-5">
        <Col md={12}>
          <h3>All Products</h3>
        </Col>
        {products.map((product) => (
          <Col md={12} className="mb-3" key={product.id}>
            <Card>
              <Card.Body>
                <Card.Title>Name: {product.name}</Card.Title>
                <Card.Text>Description: {product.description}</Card.Text>
                <Card.Text>Price: {product.price.toString()}</Card.Text>
                <Card.Text>Durability: {product.durability.toString()}</Card.Text>
                <Link 
                  to={`/product/${product.id}`}
                  state={{
                    product: {
                      ...product
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

export default ProductList;
