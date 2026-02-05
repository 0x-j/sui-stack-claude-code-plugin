/// Demonstrates capability-based access control patterns
module sui_stack_examples::capability_pattern {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    /// Admin capability - highest level of access
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Moderator capability - mid-level access
    public struct ModeratorCap has key, store {
        id: UID,
    }

    /// Protected resource that requires capabilities to modify
    public struct ProtectedResource has key {
        id: UID,
        value: u64,
        owner: address,
    }

    /// One-time initialization - creates admin cap
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // === Admin-only functions ===

    /// Create a moderator capability (admin only)
    public fun create_moderator_cap(
        _admin_cap: &AdminCap,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let mod_cap = ModeratorCap {
            id: object::new(ctx),
        };
        transfer::transfer(mod_cap, recipient);
    }

    /// Delete a moderator capability (admin only)
    public fun revoke_moderator_cap(
        _admin_cap: &AdminCap,
        mod_cap: ModeratorCap
    ) {
        let ModeratorCap { id } = mod_cap;
        object::delete(id);
    }

    /// Admin can perform any action
    public fun admin_set_value(
        _admin_cap: &AdminCap,
        resource: &mut ProtectedResource,
        new_value: u64
    ) {
        resource.value = new_value;
    }

    /// Admin can transfer ownership
    public fun admin_transfer_ownership(
        _admin_cap: &AdminCap,
        resource: &mut ProtectedResource,
        new_owner: address
    ) {
        resource.owner = new_owner;
    }

    // === Moderator functions ===

    /// Moderators can modify value within limits
    public fun moderator_set_value(
        _mod_cap: &ModeratorCap,
        resource: &mut ProtectedResource,
        new_value: u64
    ) {
        // Moderators have limits
        assert!(new_value <= 1000, EValueTooHigh);
        resource.value = new_value;
    }

    // === Public functions ===

    /// Anyone can create a protected resource
    public fun create_resource(value: u64, ctx: &mut TxContext) {
        let resource = ProtectedResource {
            id: object::new(ctx),
            value,
            owner: tx_context::sender(ctx),
        };
        transfer::share_object(resource);
    }

    /// Owner can modify their own resource
    public fun owner_set_value(
        resource: &mut ProtectedResource,
        new_value: u64,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == resource.owner, ENotOwner);
        resource.value = new_value;
    }

    /// Anyone can read the value
    public fun get_value(resource: &ProtectedResource): u64 {
        resource.value
    }

    /// Anyone can read the owner
    public fun get_owner(resource: &ProtectedResource): address {
        resource.owner
    }

    // === Error codes ===

    const ENotOwner: u64 = 0;
    const EValueTooHigh: u64 = 1;

    // === Tests ===

    #[test_only]
    use sui::test_scenario;

    #[test]
    fun test_admin_capabilities() {
        let admin = @0xAD;
        let user = @0xB0B;

        let mut scenario = test_scenario::begin(admin);

        // Init creates admin cap
        {
            init(test_scenario::ctx(&mut scenario));
        };

        // Admin creates resource
        test_scenario::next_tx(&mut scenario, admin);
        {
            create_resource(100, test_scenario::ctx(&mut scenario));
        };

        // Admin modifies resource
        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            let mut resource = test_scenario::take_shared<ProtectedResource>(&scenario);

            admin_set_value(&admin_cap, &mut resource, 999);
            assert!(get_value(&resource) == 999, 0);

            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(resource);
        };

        // Admin creates moderator cap for user
        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            create_moderator_cap(&admin_cap, user, test_scenario::ctx(&mut scenario));
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // User (moderator) modifies resource within limits
        test_scenario::next_tx(&mut scenario, user);
        {
            let mod_cap = test_scenario::take_from_sender<ModeratorCap>(&scenario);
            let mut resource = test_scenario::take_shared<ProtectedResource>(&scenario);

            moderator_set_value(&mod_cap, &mut resource, 500);
            assert!(get_value(&resource) == 500, 0);

            test_scenario::return_to_sender(&scenario, mod_cap);
            test_scenario::return_shared(resource);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EValueTooHigh)]
    fun test_moderator_limits() {
        let admin = @0xAD;
        let mod_user = @0xB0B;

        let mut scenario = test_scenario::begin(admin);

        // Setup
        {
            init(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            create_resource(100, test_scenario::ctx(&mut scenario));
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            create_moderator_cap(&admin_cap, mod_user, test_scenario::ctx(&mut scenario));
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // Moderator tries to set value too high (should fail)
        test_scenario::next_tx(&mut scenario, mod_user);
        {
            let mod_cap = test_scenario::take_from_sender<ModeratorCap>(&scenario);
            let mut resource = test_scenario::take_shared<ProtectedResource>(&scenario);

            moderator_set_value(&mod_cap, &mut resource, 2000); // Exceeds limit!

            test_scenario::return_to_sender(&scenario, mod_cap);
            test_scenario::return_shared(resource);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_owner_only() {
        let owner = @0xA;
        let attacker = @0xB;

        let mut scenario = test_scenario::begin(owner);

        // Owner creates resource
        {
            create_resource(100, test_scenario::ctx(&mut scenario));
        };

        // Attacker tries to modify (should fail)
        test_scenario::next_tx(&mut scenario, attacker);
        {
            let mut resource = test_scenario::take_shared<ProtectedResource>(&scenario);
            owner_set_value(&mut resource, 999, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(resource);
        };

        test_scenario::end(scenario);
    }
}
