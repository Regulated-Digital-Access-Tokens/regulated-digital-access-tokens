// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RegulatedToken is ERC721URIStorage, Ownable, ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
        bool isListed;
    }

    uint256 public constant ROYALTY_PERCENTAGE = 10;
    uint256 public constant MAX_RESALE_MARKUP = 110;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public mintPrices;

    uint256 private _nextTokenId = 1;
    bool private _marketplaceTransferActive;

    event TokenMinted(uint256 indexed tokenId, address indexed creator, uint256 mintPrice, string tokenURI);
    event TokenListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event TokenSale(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 salePrice,
        uint256 royaltyPaid
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);

    constructor() ERC721("Regulated Digital Access Tokens", "RDAT") Ownable(msg.sender) {}

    function mintToken(string memory tokenURI, uint256 price) external payable {
        require(price > 0, "Mint price must be > 0");
        require(msg.value == price, "Incorrect mint payment");

        uint256 tokenId = _nextTokenId;
        _nextTokenId += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        creators[tokenId] = msg.sender;
        mintPrices[tokenId] = price;

        (bool paid, ) = owner().call{value: msg.value}("");
        require(paid, "Owner payment failed");

        emit TokenMinted(tokenId, msg.sender, price, tokenURI);
    }

    function listToken(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "List price must be > 0");

        uint256 maxAllowedPrice = (mintPrices[tokenId] * MAX_RESALE_MARKUP) / 100;
        require(price <= maxAllowedPrice, "Exceeds max resale markup");

        listings[tokenId] = Listing({price: price, seller: msg.sender, isListed: true});

        emit TokenListed(tokenId, msg.sender, price);
    }

    function buyToken(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "Token not listed");
        require(msg.value == listing.price, "Incorrect payment amount");

        address creator = creators[tokenId];
        uint256 royaltyAmount = (listing.price * ROYALTY_PERCENTAGE) / 100;
        uint256 sellerAmount = listing.price - royaltyAmount;

        delete listings[tokenId];

        _marketplaceTransferActive = true;
        _transfer(listing.seller, msg.sender, tokenId);
        _marketplaceTransferActive = false;

        (bool royaltyPaid, ) = creator.call{value: royaltyAmount}("");
        require(royaltyPaid, "Royalty payment failed");

        (bool sellerPaid, ) = listing.seller.call{value: sellerAmount}("");
        require(sellerPaid, "Seller payment failed");

        emit TokenSale(tokenId, msg.sender, listing.seller, listing.price, royaltyAmount);
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "Token not listed");
        require(listing.seller == msg.sender, "Not listing seller");

        delete listings[tokenId];

        emit ListingCancelled(tokenId, msg.sender);
    }

    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("Direct transfer disabled; use buyToken");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert("Direct transfer disabled; use buyToken");
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            require(_marketplaceTransferActive, "Transfers must use buyToken");
        }

        return super._update(to, tokenId, auth);
    }
}
