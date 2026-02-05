/// Simple NFT implementation demonstrating basic Sui Move patterns
module sui_stack_examples::simple_nft {
    use std::string::{Self, String};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::package;
    use sui::display;
    use sui::url::{Self, Url};

    /// NFT struct with basic metadata
    public struct SimpleNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: Url,
        creator: address,
    }

    /// One-time witness for the module
    public struct SIMPLE_NFT has drop {}

    /// Event emitted when NFT is minted
    public struct NFTMinted has copy, drop {
        nft_id: ID,
        creator: address,
        name: String,
    }

    /// Event emitted when NFT is transferred
    public struct NFTTransferred has copy, drop {
        nft_id: ID,
        from: address,
        to: address,
    }

    /// Module initializer - sets up Display
    fun init(witness: SIMPLE_NFT, ctx: &mut TxContext) {
        let publisher = package::claim(witness, ctx);

        let mut display = display::new<SimpleNFT>(&publisher, ctx);

        display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut display, string::utf8(b"creator"), string::utf8(b"{creator}"));

        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    /// Mint a new NFT
    public fun mint(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ): SimpleNFT {
        let nft_id = object::new(ctx);
        let id_copy = object::uid_to_inner(&nft_id);
        let creator = tx_context::sender(ctx);

        let nft = SimpleNFT {
            id: nft_id,
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: url::new_unsafe_from_bytes(image_url),
            creator,
        };

        event::emit(NFTMinted {
            nft_id: id_copy,
            creator,
            name: nft.name,
        });

        nft
    }

    /// Entry function to mint and transfer NFT to sender
    public entry fun mint_to_sender(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let nft = mint(name, description, image_url, ctx);
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    /// Transfer NFT to recipient (with event)
    public entry fun transfer_nft(
        nft: SimpleNFT,
        recipient: address,
        ctx: &TxContext
    ) {
        let nft_id = object::id(&nft);
        let from = tx_context::sender(ctx);

        event::emit(NFTTransferred {
            nft_id,
            from,
            to: recipient,
        });

        transfer::public_transfer(nft, recipient);
    }

    /// Update NFT description (only by creator)
    public entry fun update_description(
        nft: &mut SimpleNFT,
        new_description: vector<u8>,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == nft.creator, ENotCreator);
        nft.description = string::utf8(new_description);
    }

    /// Burn/delete NFT (only by creator)
    public entry fun burn(nft: SimpleNFT, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == nft.creator, ENotCreator);
        let SimpleNFT { id, name: _, description: _, image_url: _, creator: _ } = nft;
        object::delete(id);
    }

    // === Getters ===

    public fun name(nft: &SimpleNFT): String {
        nft.name
    }

    public fun description(nft: &SimpleNFT): String {
        nft.description
    }

    public fun image_url(nft: &SimpleNFT): Url {
        nft.image_url
    }

    public fun creator(nft: &SimpleNFT): address {
        nft.creator
    }

    // === Error codes ===

    const ENotCreator: u64 = 0;
}
