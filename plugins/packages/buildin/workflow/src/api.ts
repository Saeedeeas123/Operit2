/** Self-contained workflow public client. Types retain the v1 workflow contract. */
export interface WorkflowResultData {
    /** Workflow ID */
    id: string;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description: string;
    /** Node count */
    nodeCount: number;
    /** Connection count */
    connectionCount: number;
    /** Whether enabled */
    enabled: boolean;
    /** Creation timestamp */
    createdAt: number;
    /** Update timestamp */
    updatedAt: number;
    /** Last execution time */
    lastExecutionTime?: number | null;
    /** Last execution status */
    lastExecutionStatus?: string | null;
    /** Total execution count */
    totalExecutions: number;
    /** Successful execution count */
    successfulExecutions: number;
    /** Failed execution count */
    failedExecutions: number;
    /** Returns a formatted string representation of the workflow */
    toString(): string;
}

/**
 * Workflow list result data
 */
export interface WorkflowListResultData {
    /** Workflow list */
    workflows: WorkflowResultData[];
    /** Total number of workflows */
    totalCount: number;
    /** Returns a formatted string representation of the workflow list */
    toString(): string;
}

/**
 * Workflow node position
 */
export interface NodePosition {
    x: number;
    y: number;
}

export interface StaticValue {
    __type?: string;
    value: string;
}

export interface NodeReference {
    __type?: string;
    nodeId: string;
}

export type ParameterValue = string | StaticValue | NodeReference;

/**
 * Trigger type
 */
export type TriggerType =
    | 'manual'
    | 'schedule'
    | 'tasker'
    | 'intent'
    | 'speech'
    | (string & { __triggerTypeBrand?: never });

/**
 * Trigger node
 */
export interface TriggerNode {
    __type?: string;
    /** Node ID */
    id: string;
    /** Node type */
    type: 'trigger';
    /** Node name */
    name: string;
    /** Node description */
    description: string;
    /** Node position */
    position: NodePosition;
    /** Trigger type */
    triggerType: TriggerType;
    /** Trigger configuration */
    triggerConfig: Record<string, string>;
}

/**
 * Execute node
 */
export interface ExecuteNode {
    __type?: string;
    /** Node ID */
    id: string;
    /** Node type */
    type: 'execute';
    /** Node name */
    name: string;
    /** Node description */
    description: string;
    /** Node position */
    position: NodePosition;
    /** Action type (tool name) */
    actionType: string;
    /** Action configuration (tool parameters) */
    actionConfig: Record<string, string | ParameterValue>;
    /** JavaScript code (optional) */
    jsCode?: string | null;
}

export type ConditionOperator =
    | 'EQ'
    | 'NE'
    | 'GT'
    | 'GTE'
    | 'LT'
    | 'LTE'
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'IN'
    | 'NOT_IN';

export interface ConditionNode {
    __type?: string;
    id: string;
    type: 'condition';
    name: string;
    description: string;
    position: NodePosition;
    left: ParameterValue;
    operator: ConditionOperator;
    right: ParameterValue;
}

export type LogicOperator = 'AND' | 'OR';

export interface LogicNode {
    __type?: string;
    id: string;
    type: 'logic';
    name: string;
    description: string;
    position: NodePosition;
    operator: LogicOperator;
}

export type ExtractMode = 'REGEX' | 'JSON' | 'SUB' | 'CONCAT' | 'RANDOM_INT' | 'RANDOM_STRING';

export interface ExtractNode {
    __type?: string;
    id: string;
    type: 'extract';
    name: string;
    description: string;
    position: NodePosition;
    source: ParameterValue;
    mode: ExtractMode;
    expression: string;
    group: number;
    defaultValue: string;
    others?: ParameterValue[];
    startIndex?: number;
    length?: number;
    randomMin?: number;
    randomMax?: number;
    randomStringLength?: number;
    randomStringCharset?: string;
    useFixed?: boolean;
    fixedValue?: string;
}

/**
 * Workflow node (union type)
 */
export type WorkflowNode = TriggerNode | ExecuteNode | ConditionNode | LogicNode | ExtractNode;

/**
 * Workflow node connection condition keywords
 */
export type WorkflowConnectionConditionKeyword =
    | 'true'
    | 'false'
    | 'on_success'
    | 'success'
    | 'ok'
    | 'on_error'
    | 'error'
    | 'failed';

/**
 * Workflow node connection condition
 */
export type WorkflowConnectionCondition = WorkflowConnectionConditionKeyword | (string & { __regexConditionBrand?: never });

/**
 * Workflow node connection
 */
export interface WorkflowNodeConnection {
    /** Connection ID */
    id: string;
    /** Source node ID */
    sourceNodeId: string;
    /** Target node ID */
    targetNodeId: string;
    /** Connection condition (optional) */
    condition?: WorkflowConnectionCondition | null;
}

/**
 * Workflow detail result data (includes the complete node and connection information)
 */
export interface WorkflowDetailResultData {
    /** Workflow ID */
    id: string;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description: string;
    /** Node list */
    nodes: WorkflowNode[];
    /** Connection list */
    connections: WorkflowNodeConnection[];
    /** Whether enabled */
    enabled: boolean;
    /** Creation timestamp */
    createdAt: number;
    /** Update timestamp */
    updatedAt: number;
    /** Last execution time */
    lastExecutionTime?: number | null;
    /** Last execution status */
    lastExecutionStatus?: string | null;
    /** Total execution count */
    totalExecutions: number;
    /** Successful execution count */
    successfulExecutions: number;
    /** Failed execution count */
    failedExecutions: number;
    /** Returns a formatted string representation of the workflow details */
    toString(): string;
}


export namespace Workflow {
    /**
     * Node position in the workflow canvas
     */
    export type Position = NodePosition;

    /**
     * Trigger node configuration
     */
    export interface Trigger extends TriggerNode { }

    /**
     * Execute node configuration
     */
    export interface Execute extends ExecuteNode { }

    /**
     * Condition node configuration
     */
    export interface Condition extends ConditionNode { }

    /**
     * Logic node configuration
     */
    export interface Logic extends LogicNode { }

    /**
     * Extract node configuration
     */
    export interface Extract extends ExtractNode { }

    /**
     * Workflow node (union type)
     */
    export type Node = WorkflowNode;

    export type ParameterValueInput =
        | string
        | number
        | boolean
        | null
        | {
            value?: string;
            nodeId?: string;
            ref?: string;
            refNodeId?: string;
        };

    export interface NodeInput {
        id?: string;
        type: 'trigger' | 'execute' | 'condition' | 'logic' | 'extract';
        name?: string;
        description?: string;
        position?: { x: number; y: number };

        triggerType?: TriggerType;
        triggerConfig?: Record<string, string>;

        actionType?: string;
        actionConfig?: Record<string, ParameterValueInput>;
        jsCode?: string;

        left?: ParameterValueInput;
        operator?: string;
        right?: ParameterValueInput;

        source?: ParameterValueInput;
        mode?: string;
        expression?: string;
        group?: number;
        defaultValue?: string;

        others?: ParameterValueInput[];
        startIndex?: number;
        length?: number;
        randomMin?: number;
        randomMax?: number;
        randomStringLength?: number;
        randomStringCharset?: string;
        useFixed?: boolean;
        fixedValue?: string;
    }

    /**
     * Workflow connection between nodes
     */
    export interface Connection extends WorkflowNodeConnection { }

    export type ConnectionConditionKeyword =
        | 'true'
        | 'false'
        | 'on_success'
        | 'success'
        | 'ok'
        | 'on_error'
        | 'error'
        | 'failed';

    export type ConnectionCondition = ConnectionConditionKeyword | (string & { __regexConditionBrand?: never });

    export interface ConnectionInput {
        id?: string;
        sourceNodeId?: string;
        targetNodeId?: string;
        condition?: ConnectionCondition | null;
    }

    /**
     * Basic workflow information
     */
    export interface Info extends WorkflowResultData { }

    /**
     * Detailed workflow information with nodes and connections
     */
    export interface Detail extends WorkflowDetailResultData { }

    /**
     * Workflow list response
     */
    export interface List extends WorkflowListResultData { }

    /**
     * Parameters for creating a workflow
     */
    export interface CreateParams {
        /** Workflow name */
        name: string;
        /** Workflow description (optional) */
        description?: string;
        /** Nodes array or JSON string (optional) */
        nodes?: NodeInput[] | string;
        /** Connections array or JSON string (optional) */
        connections?: ConnectionInput[] | string;
        /** Whether the workflow is enabled (optional, default true) */
        enabled?: boolean;
    }

    /**
     * Parameters for getting a workflow
     */
    export interface GetParams {
        /** Workflow ID */
        workflow_id: string;
    }

    /**
     * Parameters for updating a workflow
     */
    export interface UpdateParams {
        /** Workflow ID */
        workflow_id: string;
        /** New workflow name (optional) */
        name?: string;
        /** New workflow description (optional) */
        description?: string;
        /** New nodes array or JSON string (optional) */
        nodes?: NodeInput[] | string;
        /** New connections array or JSON string (optional) */
        connections?: ConnectionInput[] | string;
        /** Whether the workflow is enabled (optional) */
        enabled?: boolean;
    }

    /**
     * Parameters for deleting a workflow
     */
    export interface DeleteParams {
        /** Workflow ID */
        workflow_id: string;
    }

    export interface EnableParams {
        /** Workflow ID */
        workflow_id: string;
    }

    export interface DisableParams {
        /** Workflow ID */
        workflow_id: string;
    }

    /**
     * Parameters for triggering a workflow
     */
    export interface TriggerParams {
        /** Workflow ID */
        workflow_id: string;
    }

    export type PatchOperation = 'add' | 'update' | 'remove';

    export interface NodePatch {
        op: PatchOperation;
        id?: string;
        node?: NodeInput;
    }

    export interface ConnectionPatch {
        op: PatchOperation;
        id?: string;
        connection?: ConnectionInput;
    }

    export interface PatchParams {
        /** Workflow ID */
        workflow_id: string;

        /** New workflow name (optional) */
        name?: string;

        /** New workflow description (optional) */
        description?: string;

        /** Whether the workflow is enabled (optional) */
        enabled?: boolean;

        /** Node patch operations (optional) */
        node_patches?: NodePatch[] | string;

        /** Connection patch operations (optional) */
        connection_patches?: ConnectionPatch[] | string;
    }

    export interface Runtime {
        getAll(): Promise<WorkflowListResultData>;

        create(
            name: string,
            description?: string,
            nodes?: NodeInput[] | string | null,
            connections?: ConnectionInput[] | string | null,
            enabled?: boolean
        ): Promise<WorkflowDetailResultData>;

        get(workflowId: string): Promise<WorkflowDetailResultData>;

        update(
            workflowId: string,
            updates?: Omit<UpdateParams, 'workflow_id'>
        ): Promise<WorkflowDetailResultData>;

        patch(
            workflowId: string,
            patch?: Omit<PatchParams, 'workflow_id'>
        ): Promise<WorkflowDetailResultData>;

        setEnabled(workflowId: string, enabled: boolean): Promise<WorkflowDetailResultData>;

        enable(workflowId: string): Promise<WorkflowDetailResultData>;

        disable(workflowId: string): Promise<WorkflowDetailResultData>;

        'delete'(workflowId: string): Promise<string>;

        trigger(workflowId: string): Promise<string>;
    }
}


/** Calls the package's explicitly registered public method through the host dependency boundary. */
function call<T>(method: string, payload: object): Promise<T> {
    return ToolPkg.callDependency<object, T>("com.operit.workflow", method, payload);
}

/** Public client for dependent packages; this file has no imports or business implementation. */
export const workflow: Workflow.Runtime = {
    /** Lists stored workflows. */
    getAll: () => call("getAll", {}),
    /** Creates a workflow using the public graph input contract. */
    create: (name, description, nodes, connections, enabled) => call("create", { name, description, nodes, connections, enabled }),
    /** Reads a workflow by stable identifier. */
    get: workflowId => call("get", { workflow_id: workflowId }),
    /** Updates only supplied fields. */
    update: (workflowId, updates = {}) => call("update", { ...updates, workflow_id: workflowId }),
    /** Applies an explicit graph patch. */
    patch: (workflowId, patch = {}) => call("patch", { ...patch, workflow_id: workflowId }),
    /** Changes the enabled state. */
    setEnabled: (workflowId, enabled) => call("setEnabled", { workflow_id: workflowId, enabled }),
    /** Enables a workflow. */
    enable: workflowId => call("setEnabled", { workflow_id: workflowId, enabled: true }),
    /** Disables a workflow. */
    disable: workflowId => call("setEnabled", { workflow_id: workflowId, enabled: false }),
    /** Deletes a workflow. */
    delete: workflowId => call("delete", { workflow_id: workflowId }),
    /** Runs a workflow and reports the actual completion status. */
    trigger: workflowId => call("trigger", { workflow_id: workflowId }),
};
