//SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.14;

/// @title Hairdressing
/// @author Pablo Urriza
/// @notice Smart contract for the management of a hairdresser.
contract Hairdressing {
    // 1. Allow admins to create services.
    // 2. Allow clients to book services.
    // 3. Allow admins to manage the product supply.
    // 4. Getter functions for the frontend.

    /// =============== Variables ===============
    address public admin;
    // TO-DO Gestion de hora de apertura/cierre (por dia?)
    // TO-DO Gestion de horas disponibles por dia

    /// ============ Mutable storage ============

    /// @notice Service struct
    struct Service {
        uint id;
        string name;
        string description;
        uint price;
        uint duration;
        uint[] productIds;
        string[] productNames;
    }
    /// @notice List of all services
    mapping(uint => Service) public services;
    /// @notice List to keep track of the Services in order to be able to loop through the mapping 
    uint[] public serviceList; 
    /// @notice Id of the next service
    uint private nextServiceId = 1;

    /// @notice Product struct
    struct Product {
        uint id;
        string name;
        string description;
        uint price;
        uint durability;
    }
    /// @notice List of all Products
    mapping(uint => Product) public products;
    /// @notice List to keep track of the Products in order to be able to loop through the mapping
    uint[] public productList; 
    /// @notice Id of the next product
    uint private nextProductId = 1;

    /// @notice Booking struct
    struct Booking {
        uint id;
        uint date;
        uint serviceId;
        string serviceName;
        address client;
    }
    /// @notice List of all Bookings
    mapping(uint => Booking) public bookings;
    /// @notice List to keep track of the Bookings in order to be able to loop through the mapping
    uint[] public bookingList; 
    /// @notice Id of the next booking
    uint private nextBookingId = 1;

    /// @notice Mapping of clientes and their booked services
    mapping(address => uint[]) private userBookings;

    struct MultiSelectStruct {
        uint value;
        string label;
    }

    /// =========== Constructor ===========

    constructor() {
        admin = msg.sender;
    }

    /// ============ Modifiers ============

    /// @notice Ensure only admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    /// @notice Ensure service exists
    modifier serviceExists(uint _serviceId) {
        // Check if serviceId is valid
        require(
            _serviceId > 0 && _serviceId < nextServiceId,
            "Service does not exist"
        );
        _;
    }

    /// @notice Ensure service exists
    modifier productExists(uint _productId) {
        // Check if productId is valid
        require(
            _productId > 0 && _productId < nextProductId,
            "Product does not exist"
        );
        _;
    }

    /// @notice Ensure booking exists
    modifier bookingExists(uint _bookingId) {
        // Check if _bookingId is valid
        require(
            _bookingId > 0 && _bookingId < nextBookingId,
            "Booking does not exist"
        );
        _;
    }

    /// ============ Functions ============

    /// Products
    /// @notice Creates a new product.
    /// @param _name — name of the product.
    /// @param _description — service description.
    /// @param _price — price of the product.
    /// @param _durability — the durability in uses.
    function createProduct(string calldata _name, string calldata _description, uint _price, uint _durability) external onlyAdmin() {
        products[nextProductId] = Product(
            nextProductId,
            _name,
            _description,
            _price,
            _durability
        );

        // Save the productsId 
        productList.push(nextProductId);

        // Increment the service counter
        nextProductId++;
    }

    // TO-DO
    /// @notice Deletes an existing product.
    /// @param _productId — product id from the product to be deleted.
    function deleteProduct(uint _productId) external onlyAdmin() productExists(_productId) {
        // Comprobar que no pertenece a ningún Servicio
    }

    /// Services

    /// @notice Creates a new service.
    /// @param _name — name of the service.
    /// @param _description — service description.
    /// @param _price — price of the service.
    /// @param _duration — the duration, in seconds, for which the auction will accept offers.
    /// @param _products — array of the products needed for the service.
    function createService(string calldata _name, string calldata _description, uint _price, uint _duration, MultiSelectStruct[] memory _products) external onlyAdmin() {
        // Duration should be between 5 minutes and 2 hours
        require(
            _duration >= 5 minutes && _duration <= 2 hours,
            "Duration should be between 5 minutes and 2 hours"
        );

        uint[] memory productIds = new uint[](_products.length);
        string[] memory productNames = new string[](_products.length);
        for (uint i = 0; i < _products.length; i++) {
            productIds[i] = _products[i].value;
            productNames[i] = _products[i].label;
        }

        services[nextServiceId] = Service(
            nextServiceId,
            _name,
            _description,
            _price,
            _duration,
            productIds,
            productNames
        );

        // Save the auction to user auction mapping
        //userAuctions[msg.sender].push(nextAuctionId);

        // Save the servicesId 
        serviceList.push(nextServiceId);

        // Increment the service counter
        nextServiceId++;
    }

    // TO-DO
    /// @notice Deletes an existing service.
    /// @param _serviceId — service id from the service to be deleted.
    function deleteService(uint _serviceId) external onlyAdmin() serviceExists(_serviceId) {
        // Comprobar que no hay ninguna reserva de este Servicio
    }

    /// Bookings

    /// @notice Creates a new booking.
    /// @param _date — date of the service.
    /// @param _serviceId — service id from the service to be booked.
    function createBooking(uint _date, uint _serviceId) external serviceExists(_serviceId) {
        // Check date? Not needed if we set the dates that appear on the app TO-DO
        /*require(
            _duration >= 5 minutes && _duration <= 2 hours,
            "Duration should be between 5 minutes and 2 hours"
        );*/

        bookings[nextBookingId] = Booking(
            nextBookingId,
            _date, 
            _serviceId,
            services[_serviceId].name,
            msg.sender
        );

        // Save the booking to client bookings mapping
        userBookings[msg.sender].push(nextBookingId);

        // Save the bookingId 
        bookingList.push(nextBookingId);

        // Increment the booking counter
        nextBookingId++;
    }

    // TO-DO
    /// @notice Deletes an existing booking.
    /// @param _bookingId — product id from the product to be deleted.
    function deleteBooking(uint _bookingId) external bookingExists(_bookingId) {
       
    }

    /// ============ Getter Functions ============

    /// @notice - List of all the services
    function getServices() external view returns (Service[] memory) {
        Service[] memory _allServices = new Service[](nextServiceId - 1);

        for (uint i = 1; i < nextServiceId; i++) {
            _allServices[i - 1] = services[i];
            /*for (uint j = 0; j < services[i].productIds.length; j++) {
                _allServices[i - 1].productNames[j] = products[services[i].productIds[j]].name;
            }*/
        }

        // TO-DO Better?
        /*Service[] memory _allServices = new Service[](serviceList.length);

        for (uint i = 0; i < serviceList.length; i++) {
            _allServices[i] = Service(
                _services[serviceList[i]].id,
                _services[serviceList[i]].name,
                _services[serviceList[i]].description,
                _services[serviceList[i]].price,
                _services[serviceList[i]].duration,
                _services[serviceList[i]].productIds
            );
        }*/

        return _allServices;
    }

    /// @notice - List of all the services for be displayed on a MultiSelect
    function getServicesMultiSelect() external view returns (MultiSelectStruct[] memory) {
        MultiSelectStruct[] memory _allServices = new MultiSelectStruct[](nextServiceId - 1);

        for (uint i = 1; i < nextServiceId; i++) {
            _allServices[i - 1].value = services[i].id;
            _allServices[i - 1].label = services[i].name;
        }

        return _allServices;
    }

    /// @notice - List of all the products
    function getProducts() external view returns (Product[] memory) {
        Product[] memory _allProducts = new Product[](nextProductId - 1);

        for (uint i = 1; i < nextProductId; i++) {
            _allProducts[i - 1] = products[i];
        }

        // TO-DO Better?
        /*Product[] memory _allProducts = new Product[](productList.length);

        for (uint i = 0; i < productList.length; i++) {
            _allProducts[i] = Product(
                _services[productList[i]].id,
                _services[productList[i]].name,
                _services[productList[i]].description,
                _services[productList[i]].price,
                _services[productList[i]].durability
            );
        }*/

        return _allProducts;
    }

    /// @notice - List of all the products for be displayed on a MultiSelect
    function getProductsMultiSelect() external view returns (MultiSelectStruct[] memory) {
        MultiSelectStruct[] memory _allProducts = new MultiSelectStruct[](nextProductId - 1);

        for (uint i = 1; i < nextProductId; i++) {
            _allProducts[i - 1].value = products[i].id;
            _allProducts[i - 1].label = products[i].name;
        }

        return _allProducts;
    }

    /// @notice - List of all the bookings
    function getBookings() external view returns (Booking[] memory) {
        Booking[] memory _allBookings = new Booking[](nextBookingId - 1);

        for (uint i = 1; i < nextBookingId; i++) {
            _allBookings[i - 1] = bookings[i];
        }

        // TO-DO Better?
        /*Booking[] memory _allBookings = new Booking[](bookingList.length);

        for (uint i = 0; i < bookingList.length; i++) {
            _allBookings[i] = Booking(
                bookings[bookingList[i]].serviceId,
                bookings[bookingList[i]].date,
                bookings[bookingList[i]].client
            );
        }*/

        return _allBookings;
    }

    /// @notice - List of bookings for a client
    /// @param _client - Client address
    function getUserBookings(address _client) external view returns (Booking[] memory) {
        uint[] storage userBookingIds = userBookings[_client];
        Booking[] memory _bookings = new Booking[](userBookingIds.length);

        for (uint i = 0; i < userBookingIds.length; i++) {
            uint bookingId = userBookingIds[i];
            _bookings[i] = bookings[bookingId];
        }

        return _bookings;
    }
}