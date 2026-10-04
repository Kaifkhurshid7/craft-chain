// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/**
 * @title CraftBatch721
 * @notice ERC-721 NFT contract for handcrafted product batch traceability
 * @dev Combines ERC721, AccessControl, and step recording functionality
 */
contract CraftBatch721 is
    ERC721,
    ERC721URIStorage,
    AccessControl,
    ERC721Burnable
{
    /**
     * @dev Role identifier for addresses authorized to mint batches
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Counter for generating unique token IDs
     */
    uint256 private _tokenIdCounter;

    /**
     * @dev Structure representing a single supply chain step
     */
    struct Step {
        bytes32 stepHash;
        address actor;
        uint256 timestamp;
    }

    /**
     * @dev Mapping from token ID to array of steps recorded for that batch
     */
    mapping(uint256 => Step[]) public batchSteps;

    /**
     * @dev Event emitted when a new batch NFT is minted
     * @param tokenId The newly created token ID
     * @param to The address receiving the NFT
     * @param metadataURI IPFS URI pointing to batch metadata
     */
    event BatchMinted(uint256 indexed tokenId, address indexed to, string metadataURI);

    /**
     * @dev Event emitted when a supply chain step is recorded
     * @param tokenId The batch this step belongs to
     * @param actor The address recording the step (current owner)
     * @param stepHash Cryptographic hash of the step data
     * @param timestamp Block timestamp of the recording
     */
    event StepRecorded(
        uint256 indexed tokenId,
        address indexed actor,
        bytes32 indexed stepHash,
        uint256 timestamp
    );

    /**
     * @dev Constructor initializes the contract with ERC-721 metadata
     */
    constructor() ERC721("CraftBatch", "CRAFT") {
        // Grant DEFAULT_ADMIN_ROLE to contract deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _tokenIdCounter = 1;
    }

    /**
     * @notice Mints a new batch NFT with metadata reference
     * @dev Only callable by addresses with MINTER_ROLE
     * @param to The address that will own the newly minted NFT
     * @param metadataURI IPFS URI pointing to batch metadata JSON
     * @return tokenId The newly created token ID
     */
    function mintBatch(address to, string memory metadataURI)
        public
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit BatchMinted(tokenId, to, metadataURI);
        return tokenId;
    }

    /**
     * @notice Records a supply chain step for a batch
     * @dev Only callable by the current owner of the batch NFT
     * @param tokenId The ID of the batch
     * @param stepHash Cryptographic hash of the step data stored on IPFS
     */
    function recordStep(uint256 tokenId, bytes32 stepHash)
        public
    {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only token owner can record steps");
        require(stepHash != bytes32(0), "Step hash cannot be zero");

        Step memory newStep = Step({
            stepHash: stepHash,
            actor: msg.sender,
            timestamp: block.timestamp
        });

        batchSteps[tokenId].push(newStep);

        emit StepRecorded(tokenId, msg.sender, stepHash, block.timestamp);
    }

    /**
     * @notice Retrieves all steps recorded for a batch
     * @param tokenId The ID of the batch
     * @return Array of Step records for the batch
     */
    function getBatchSteps(uint256 tokenId)
        public
        view
        returns (Step[] memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return batchSteps[tokenId];
    }

    /**
     * @notice Retrieves the number of steps recorded for a batch
     * @param tokenId The ID of the batch
     * @return Number of steps
     */
    function getStepCount(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        require(_exists(tokenId), "Token does not exist");
        return batchSteps[tokenId].length;
    }

    /**
     * @notice Retrieves a specific step recorded for a batch
     * @param tokenId The ID of the batch
     * @param stepIndex The index of the step in the steps array
     * @return The Step record
     */
    function getStep(uint256 tokenId, uint256 stepIndex)
        public
        view
        returns (Step memory)
    {
        require(_exists(tokenId), "Token does not exist");
        require(stepIndex < batchSteps[tokenId].length, "Step index out of bounds");
        return batchSteps[tokenId][stepIndex];
    }

    /**
     * @notice Checks if a token exists
     * @param tokenId The ID to check
     * @return True if the token exists
     */
    function _exists(uint256 tokenId)
        internal
        view
        returns (bool)
    {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @notice Retrieves the URI for a token
     * @dev Override required by ERC721URIStorage
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice Supports querying whether contract implements an interface
     * @dev Override required by AccessControl and ERC721URIStorage
     * @param interfaceId The interface ID to check
     * @return True if supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
