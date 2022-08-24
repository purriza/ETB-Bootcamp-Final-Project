import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/esm/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { Form, Modal } from "react-bootstrap";
import { showError } from "../utils/common";
import { Route, Routes } from "react-router-dom";

import Select from 'react-select'

import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

function Header ({ blockchain }) { 
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Product form fields
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [durability, setDurability] = useState(0);

  // Service form fields
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);

  // Booking form fields
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = React.useState(null);

  useEffect(() => {
    (async () => {
      blockchain.hairdressing && setProducts(await blockchain.hairdressing.getProductsMultiSelect());
      blockchain.hairdressing && setServices(await blockchain.hairdressing.getServicesMultiSelect());
    })();
  }, [blockchain]); 

  const addProduct = () => {
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
  };

  const addService = () => {
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
  };

  const addBooking = () => {
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  const onSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      await blockchain.hairdressing.createProduct(
        productName,
        productDescription,
        productPrice,
        durability
      );
    } catch (error) {
      showError(error);
    }
    handleCloseProductModal();
  };

  const onSubmitService = async (e) => {
    e.preventDefault();
    try {
      await blockchain.hairdressing.createService(
        serviceName,
        serviceDescription,
        servicePrice,
        duration*60,
        selectedProducts
      );
    } catch (error) {
      showError(error);
    }
    handleCloseServiceModal();
  };

  const onSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      // We have to transform JavaScript date to unix timestamp (number of seconds since 1970)
      // First get the miliseconds and then divide it to get the seconds
      const dateInSeconds = Math.floor(selectedDate.getTime() / 1000);

      await blockchain.hairdressing.createBooking(
        dateInSeconds,
        selectedService
      );
    } catch (error) {
      showError(error);
    }
    handleCloseBookingModal();
  };

  return (
    <div>
      <Navbar bg="primary" expand="lg" variant="dark">
        <Container>
          <Link to="/" className="navbar-brand">
            Hairdressing Dapp
          </Link>
          <Button variant="warning" onClick={addProduct}>
            + New Product
          </Button>
            <Button variant="warning" onClick={addService}>
            + New Service
          </Button>
            <Button variant="warning" onClick={addBooking}>
            + New Booking
          </Button>
          {/*<Link to={`/user/`}>
            <Button variant="warning">View user info</Button>
          </Link>*/}
        </Container>
      </Navbar>

      <Modal show={showProductModal} onHide={handleCloseProductModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => onSubmitProduct(e)}>
            <Form.Group className="mb-2" controlId="productName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="productDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="productPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="durability">
              <Form.Label>Durability</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter durability"
                value={durability}
                onChange={(e) => setDurability(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-2">
              Add
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showServiceModal} onHide={handleCloseServiceModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => onSubmitService(e)}>
            <Form.Group className="mb-2" controlId="serviceName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="serviceDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="servicePrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="duration">
              <Form.Label>Duration (in minutes)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="products">
              <Form.Label>Products</Form.Label>
              <Select
                isMulti
                name="products"
                options={products}
                className="basic-multi-select"
                placeholder="Enter products"
                onChange={setSelectedProducts}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-2">
              Add
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showBookingModal} onHide={handleCloseBookingModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => onSubmitBooking(e)}>
            <Form.Group className="mb-2" controlId="service">
              <Form.Label>Service</Form.Label>
              <Select
                isMulti
                name="services"
                options={services}
                className="basic-single"
                placeholder="Enter service"
                onChange={setSelectedService}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="date">
            <Form.Label>Date</Form.Label>
            <br></br>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                value={selectedDate}
                ampm="true"
                ampmInClock="false"
                disablePast="true"
                minTime={new Date(0, 0, 0, 9)}
                maxTime={new Date(0, 0, 0, 18)}
                onChange={(newDate) => {
                  setSelectedDate(newDate);
                }}
              />
              </LocalizationProvider>
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-2">
              Book!
            </Button>
          </form>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Header;
