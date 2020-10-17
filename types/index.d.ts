interface Array<T> {
    /** 获取栈顶元素 */
    top(): T | undefined;
}

interface RootContext {
    stack: Def[];
    _pending: string[][];
    interface: any[];
    /** 文本内容可能因为<span><code>等标签的存在而被打断，用于获取一段完整的文本 */
    plain_text_buf: string;
}

interface ParamRootContext {
    params: {
        params: [];
        interface: [];
        _pending: string[][];
        comment: string | null;
    };
}

interface MethodDef {
    type: 'method';
    /** 原始名字，例如zrender.init(opts) */
    raw_name: string;
    /** 函数名字，例如init */
    method_name: string;
}

interface ClassDef {
    type: 'class';
    raw_name: string;
    /** class名字，例如Displayable */
    class_name: string;
    methods: any;
}

interface ParamDef {
    /** 参数名字 */
    __name: string;
    /** 参数类型 */
    __type: string;
    /** 默认值 */
    __default?: any;
    /** 备注 */
    __comment?: string;
}

type Def = MethodDef | ClassDef;
