digraph DecentralizedTradingPlatform {
    
    // Graph styling
    rankdir=TB;  // Top to Bottom layout for proper positioning
    node [shape=box, style=rounded, width=3, fontsize=10];  // Clean node styling

    // Layer 1: PulseChain
    subgraph cluster_pulsechain {
        label="Layer 1: PulseChain (Core Blockchain Layer)";
        style=filled;
        color=lightgrey;
        
        ExecutionEngine [label="Execution Engine (Smart Contracts)"];
        TransactionPool [label="Transaction Pool"];
        MarketMakers [label="Executed"];
        LiquidityPool [label="Liquidity Pool (Ensures Trade Completion)"];
        Validator [label="Validator (Proof of Stake)"];
        ProofOfStake [label="Proof of Stake Block Building Process"];
    }

    // Layer 2: System Interface and Architecture
    subgraph cluster_layer2 {
        label="Layer 2: System Interface and Architecture";
        style=filled;
        color=lightblue;

        // Core Components
        TradingInterface [label="Wallet Connect (MetaMask Integration)"];
        OrderBook [label="Order Book"];
        zkSecurity [label="zk-Proof Security Module"];
        
        // Trade Types
        OpenMarketOrder [label="Open Market Order (Public Instant Swaps)"];
        SecuredMarketOrder [label="Secured Market Order (Private Instant Swaps)"];
        OpenLimitSwap [label="Open Limit Swap (Public Future Terms)"];
        SecuredLimitSwap [label="Secured Limit Swap (Private Future Terms)"];
        
        // zk-Proof Workflow
        zkLock [label="zk-Lock (Hides Trade Details)"];
        zkReveal [label="zk-Reveal (Reveals Trade Details)"];

        // Utility Component
        TelegramFaucet [label="AngelSwap Web Interface"];
    }

    // Relationships within Layer 2
    TradingInterface -> OpenMarketOrder [label="Initiates public market orders"];
    TradingInterface -> SecuredMarketOrder [label="Initiates private market orders"];
    TradingInterface -> OpenLimitSwap [label="Places public limit swaps"];
    TradingInterface -> SecuredLimitSwap [label="Places private limit swaps"];

    OpenMarketOrder -> TransactionPool [label="Visible in transaction pool"];
    SecuredMarketOrder -> zkLock [label="Private trade details"];
    OpenLimitSwap -> TransactionPool [label="Visible in transaction pool"];
    SecuredLimitSwap -> zkLock [label="Hides trade details"];

    zkLock -> TransactionPool [label="Sends private transactions"];
    zkReveal -> SecuredMarketOrder [label="Reveals on execution"];
    zkReveal -> SecuredLimitSwap [label="Reveals on execution"];

    OpenMarketOrder -> LiquidityPool [label="Utilizes liquidity"];
    SecuredMarketOrder -> LiquidityPool [label="Utilizes liquidity"];
    OpenLimitSwap -> OrderBook [label="Managed through order book"];
    SecuredLimitSwap -> OrderBook [label="Managed through order book"];

    zkSecurity -> zkLock [label="Handles transaction hiding"];
    zkSecurity -> zkReveal [label="Handles transaction revealing"];

    // Relationships to Layer 1
    TransactionPool -> ExecutionEngine [label="Processes transactions"];
    ExecutionEngine -> MarketMakers [label="Execute"];
    ExecutionEngine -> LiquidityPool [label="Ensures liquidity"];

    // Proof of Stake and Validator in Layer 1
    ExecutionEngine -> Validator [label="Validates blocks"];
    ProofOfStake -> Validator [label="Proof of Stake consensus"];
    Validator -> ProofOfStake [label="Participates in block building process"];

    // Utility Connections
    TelegramFaucet -> TradingInterface [label="Access via Browser"];

    // Add and Remove Liquidity boxes pointing to Liquidity Pool
    subgraph cluster_add_liquidity {
        label="Add Liquidity";
        style=dotted;
        AddLiquidity [label="Add Liquidity"];
    }

    subgraph cluster_remove_liquidity {
        label="Remove Liquidity";
        style=dotted;
        RemoveLiquidity [label="Remove Liquidity"];
    }

    // Linking liquidity actions to the Liquidity Pool
    AddLiquidity -> LiquidityPool [label="Increases liquidity"];
    RemoveLiquidity -> LiquidityPool [label="Decreases liquidity"];
}
