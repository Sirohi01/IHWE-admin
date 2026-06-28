import { useEffect, useState } from "react";
import { Sparkles, Save, CheckCircle2, AlertTriangle, Loader2, Eye, EyeOff, ShieldCheck, HelpCircle, Key, Info, Check, UploadCloud, XCircle, FlaskConical } from "lucide-react";
import Swal from "sweetalert2";
import { aiVerificationSettingsApi } from "../../lib/api";

const GEMINI_MODELS = [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recommended)" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
];

const OPENAI_MODELS = [
    { value: "gpt-4o-mini", label: "GPT-4o mini (Recommended)" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
];

export default function AiVerificationSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const [provider, setProvider] = useState("gemini");
    const [isEnabled, setIsEnabled] = useState(false);
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
    const [openaiApiKey, setOpenaiApiKey] = useState("");
    const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
    const [hasGeminiKey, setHasGeminiKey] = useState(false);
    const [hasOpenaiKey, setHasOpenaiKey] = useState(false);

    // Manual "test with a real image" state
    const [testDocFile, setTestDocFile] = useState(null);
    const [testDocPreview, setTestDocPreview] = useState("");
    const [testDocName, setTestDocName] = useState("Aadhar Card");
    const [testDocGender, setTestDocGender] = useState("");
    const [testDocRunning, setTestDocRunning] = useState(false);
    const [testDocResult, setTestDocResult] = useState(null);

    const isGemini = provider === "gemini";
    const currentApiKey = isGemini ? geminiApiKey : openaiApiKey;
    const currentModel = isGemini ? geminiModel : openaiModel;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await aiVerificationSettingsApi.get();
            if (data) {
                setProvider(data.provider || "gemini");
                setIsEnabled(!!data.isEnabled);
                setGeminiModel(data.geminiModel || "gemini-2.5-flash");
                setOpenaiModel(data.openaiModel || "gpt-4o-mini");
                setHasGeminiKey(!!data.hasGeminiKey);
                setHasOpenaiKey(!!data.hasOpenaiKey);
            }
        } catch {
            Swal.fire("Error", "Failed to load AI verification settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        const hasSavedKey = isGemini ? hasGeminiKey : hasOpenaiKey;
        if (!currentApiKey && !hasSavedKey) {
            Swal.fire("Warning", "Please enter an API key first to test it.", "warning");
            return;
        }
        if (isBusy) return;
        setTesting(true);
        try {
            // If nothing new was typed, leave apiKey out so the backend tests the already-saved key.
            const result = await aiVerificationSettingsApi.testConnection({
                provider,
                ...(currentApiKey ? { apiKey: currentApiKey } : {}),
                model: currentModel,
            });
            if (result.success) {
                Swal.fire({ icon: "success", title: "Connection Successful", text: result.message, timer: 2000, showConfirmButton: false });
            } else {
                Swal.fire("Connection Failed", result.message, "error");
            }
        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Test request failed", "error");
        } finally {
            setTesting(false);
        }
    };

    const handleTestDocFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setTestDocFile(file);
        setTestDocPreview(URL.createObjectURL(file));
        setTestDocResult(null);
    };

    // Revoke the previous preview object URL whenever it's replaced or the page unmounts, to avoid leaking memory.
    useEffect(() => {
        return () => {
            if (testDocPreview) URL.revokeObjectURL(testDocPreview);
        };
    }, [testDocPreview]);

    const isBusy = saving || testing || testDocRunning;

    const handleRunDocTest = async () => {
        if (!testDocFile) {
            Swal.fire("Warning", "Pehle ek image select karo.", "warning");
            return;
        }
        if (isBusy) return;
        setTestDocRunning(true);
        setTestDocResult(null);
        try {
            const formData = new FormData();
            formData.append("file", testDocFile);
            formData.append("documentName", testDocName || "Test Document");
            // Use whatever the admin currently has selected in the form (even if unsaved),
            // not the last saved settings, so the test reflects what's on screen right now.
            formData.append("provider", provider);
            if (currentApiKey) formData.append("apiKey", currentApiKey);
            formData.append("model", currentModel);
            if (testDocGender) formData.append("expectedGender", testDocGender);

            const response = await aiVerificationSettingsApi.testDocument(formData);
            setTestDocResult(response.result);
        } catch (error) {
            setTestDocResult({ skipped: true, reason: "error", error: error?.response?.data?.message || "Test request failed" });
        } finally {
            setTestDocRunning(false);
        }
    };

    const handleSave = async () => {
        if (isBusy) return;
        setSaving(true);
        try {
            const payload = {
                provider,
                isEnabled,
                geminiModel,
                openaiModel,
            };
            if (geminiApiKey) payload.geminiApiKey = geminiApiKey;
            if (openaiApiKey) payload.openaiApiKey = openaiApiKey;

            await aiVerificationSettingsApi.save(payload);
            setGeminiApiKey("");
            setOpenaiApiKey("");
            Swal.fire({ icon: "success", title: "Settings Saved", timer: 1500, showConfirmButton: false });
            fetchSettings();
        } catch (error) {
            Swal.fire("Error", error?.response?.data?.message || "Failed to save settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-[#23471d]" />
            </div>
        );
    }

    return (
        <div className="px-2 lg:px-4 py-4 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#23471d]/10 rounded-xl flex items-center justify-center border border-[#23471d]/20 shrink-0">
                        <ShieldCheck className="w-6 h-6 text-[#23471d]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Document Verification</h1>
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                            Automatically detect inappropriate content or wrong document types (e.g. random photo instead of Aadhar Card) when exhibitors upload documents.
                        </p>
                    </div>
                </div>
                <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    Need Help?
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-2 space-y-4">
                    {/* Main Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* Enable Section */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#23471d]/10 rounded-lg flex items-center justify-center text-[#23471d]">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Enable AI Verification</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Turn on AI-powered document verification for exhibitors.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} className="sr-only peer" />
                                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#23471d]"></div>
                            </label>
                        </div>

                        <div className="p-6 space-y-7">
                            {/* Provider Section */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">AI Provider</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Gemini Card */}
                                    <button
                                        onClick={() => setProvider("gemini")}
                                        className={`relative p-4 rounded-xl border text-left transition-all ${provider === "gemini"
                                                ? "border-[#23471d] bg-[#23471d]/5 ring-1 ring-[#23471d] shadow-sm"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Sparkles className={`w-5 h-5 mt-0.5 ${provider === "gemini" ? "text-[#23471d]" : "text-gray-400"}`} />
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`font-bold ${provider === "gemini" ? "text-gray-900" : "text-gray-700"}`}>Google Gemini</span>
                                                    {/* <span className="px-2 py-0.5 rounded-full bg-[#23471d]/10 text-[#23471d] text-[10px] font-bold tracking-wide">Free tier</span> */}
                                                </div>
                                                <p className={`text-xs mt-1 ${provider === "gemini" ? "text-[#23471d] font-medium" : "text-gray-500"}`}>Recommended</p>
                                            </div>
                                        </div>
                                        {provider === "gemini" && (
                                            <div className="absolute top-4 right-4 w-5 h-5 bg-[#23471d] rounded-full flex items-center justify-center text-white">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        {/* Show connection status checkmark if key is saved */}
                                        {provider === "gemini" && hasGeminiKey && !isGemini && (
                                            <CheckCircle2 className="absolute bottom-4 right-4 w-4 h-4 text-[#23471d]" />
                                        )}
                                        {provider !== "gemini" && hasGeminiKey && (
                                            <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    {/* OpenAI Card */}
                                    <button
                                        onClick={() => setProvider("openai")}
                                        className={`relative p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${provider === "openai"
                                                ? "border-[#23471d] bg-[#23471d]/5 ring-1 ring-[#23471d] shadow-sm"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${provider === "openai" ? "text-gray-900" : "text-gray-500"}`}>
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.0192 19.818a5.9847 5.9847 0 0 0 3.9977-2.9001 6.0462 6.0462 0 0 0-.735-7.0968zM10.9238 21.036c-2.4578 0-4.6318-1.5975-5.3217-3.9189l1.1648-.6718c.6833 2.148 2.658 3.5937 4.9455 3.5937h1.4938l-2.2824 2.2783v-1.2813zm-6.1966-2.5857a5.0463 5.0463 0 0 1-1.6364-4.8093l.9765.5647c-.5041 1.7686.0694 3.7042 1.4883 4.8876l.7818 1.3533a5.0478 5.0478 0 0 1-1.6102-1.9963zm-2.0954-5.9185a5.0456 5.0456 0 0 1 2.378-4.505l-.9765-.5638c-1.3932 1.1964-2.1818 3.0135-2.0954 4.8804v2.7067l.6939-1.2018zm5.2892-6.5517a5.047 5.047 0 0 1 4.8697-1.4285l-1.1647.6713a4.0538 4.0538 0 0 0-4.6157 1.258l-.7823-1.3533a5.047 5.047 0 0 1 1.693-1.1475zm6.197 2.5857c1.395-.9164 3.1979-1.1147 4.7737-.5254l-.9765-.5638a4.054 4.054 0 0 0-3.3512 1.2062l-.7818-1.3532a5.0476 5.0476 0 0 1 2.9733-.5387l-2.6375 1.7749zm2.0954 5.9186c-.5206 1.636-1.849 2.8797-3.5134 3.2872l.9765.5637a5.0473 5.0473 0 0 0 2.5369-4.851v-2.7066l-.6939 1.2017h.6939zm-4.7578-2.698a3.149 3.149 0 0 1-1.4938.8624v-2.0007l1.7317-.9995c.2917.3713.4312.8358.3976 1.3061l-.6355.8317zm-1.4938-2.015v1.9934l-1.7258-.996c-.1988-.501-.1988-1.0573 0-1.5583l1.7258.9961v-.4352zm2.0163-.1634l-1.7336-1.0006c.3813-.2556.8407-.3767 1.3048-.3446v1.9863l.4288-.6411zm-5.1119-1.0051l1.7336 1.0006v2.0007c-.4316-.279-.7606-.693-.9354-1.1713l-.7982-1.83zm-1.0963 1.9682c.0326-.4734.2046-.9205.4925-1.2828l1.7303 1.0016-1.7303.9984-.4925-.7172zm1.0963 4.0205c.3486.291.7852.4578 1.2393.4735l-1.7317-1.0006v-1.9897l.4924 2.5168z" />
                                            </svg>
                                        </div>
                                        <span className={`font-bold ${provider === "openai" ? "text-gray-900" : "text-gray-700"}`}>OpenAI</span>
                                        {provider === "openai" && (
                                            <div className="absolute top-4 right-4 w-5 h-5 bg-[#23471d] rounded-full flex items-center justify-center text-white ml-auto">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        {provider !== "openai" && hasOpenaiKey && (
                                            <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* API Key Section */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    {isGemini ? "Gemini API Key" : "OpenAI API Key"}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Key className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={currentApiKey}
                                        onChange={(e) => (isGemini ? setGeminiApiKey(e.target.value) : setOpenaiApiKey(e.target.value))}
                                        placeholder={isGemini && hasGeminiKey ? "Key saved — type to replace" : (!isGemini && hasOpenaiKey ? "Key saved — type to replace" : "Paste API key here")}
                                        className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#23471d]/20 focus:border-[#23471d] transition-all placeholder:text-gray-400"
                                    />
                                    <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 ml-1">Your API key is encrypted and stored securely.</p>
                            </div>

                            {/* Model Section */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Model</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <Sparkles className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <select
                                        value={currentModel}
                                        onChange={(e) => (isGemini ? setGeminiModel(e.target.value) : setOpenaiModel(e.target.value))}
                                        className="w-full border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#23471d]/20 focus:border-[#23471d] transition-all bg-white appearance-none cursor-pointer"
                                    >
                                        {(isGemini ? GEMINI_MODELS : OPENAI_MODELS).map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                                    <Info className="w-3 h-3" />
                                </div>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    When AI flags a document (nudity, or wrong document type uploaded in place of the required one), the upload is rejected immediately with a clear reason — the exhibitor must re-upload the correct file. If the AI provider is temporarily unreachable, uploads continue normally without AI checks rather than blocking the exhibitor.
                                </p>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={handleTestConnection}
                                disabled={isBusy}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50"
                            >
                                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-gray-500" />}
                                Test Connection
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isBusy}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#23471d] text-white text-sm font-semibold hover:bg-[#23471d]/90 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column (How it works + Test) */}
                <div className="space-y-2 h-fit sticky top-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        {/* Illustration area */}
                        <div className="h-28 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-2 right-2 w-16 h-16 bg-[#23471d]/5 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-2 left-2 w-20 h-20 bg-[#23471d]/5 rounded-full blur-3xl"></div>

                            {/* Document Graphic */}
                            <div className="relative z-10 w-32 h-20 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-3 flex flex-col gap-2 transform -rotate-3">
                                <div className="flex gap-2 items-center">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                    <div className="space-y-1 flex-1">
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
                                        <div className="w-2/3 h-1.5 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-4 bg-[#23471d] rounded flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
                                        <div className="w-3/4 h-1.5 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#23471d] rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="text-base font-bold text-gray-900 mb-3 flex flex-col gap-1.5">
                                How it works
                                <div className="w-6 h-0.5 bg-gray-300"></div>
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    "Detects inappropriate content and wrong document types",
                                    "Instantly blocks incorrect uploads",
                                    "Ensures only valid documents are accepted",
                                    "Helps maintain platform quality and compliance"
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-[#23471d]/10 flex items-center justify-center border border-[#23471d]/20 shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-[#23471d]" />
                                        </div>
                                        <span className="text-xs text-gray-600 leading-relaxed font-medium">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Test with a real document */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#23471d]/10 rounded-lg flex items-center justify-center text-[#23471d]">
                                <FlaskConical className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Test with a Real Document</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Upload an image to instantly see what the AI would decide — no upload is saved anywhere.</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expected Document Type</label>
                                <input
                                    type="text"
                                    value={testDocName}
                                    onChange={(e) => setTestDocName(e.target.value)}
                                    placeholder="e.g. Aadhar Card"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#23471d]/20 focus:border-[#23471d] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expected Gender (Optional)</label>
                                <select
                                    value={testDocGender}
                                    onChange={(e) => setTestDocGender(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#23471d]/20 focus:border-[#23471d] transition-all bg-white"
                                >
                                    <option value="">Don't check gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Test Image</label>
                                <label className="flex items-center gap-2 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-all">
                                    <UploadCloud className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">{testDocFile ? testDocFile.name : "Choose an image..."}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleTestDocFileChange} />
                                </label>
                            </div>

                            {testDocPreview && (
                                <div className="flex items-start gap-4">
                                    <img src={testDocPreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shrink-0" />
                                    <button
                                        onClick={handleRunDocTest}
                                        disabled={isBusy}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#23471d] text-white text-sm font-semibold hover:bg-[#23471d]/90 transition-all disabled:opacity-50"
                                    >
                                        {testDocRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                                        Run AI Test
                                    </button>
                                </div>
                            )}

                            {testDocResult && (
                                <div>
                                    {testDocResult.skipped ? (
                                        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <AlertTriangle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">AI check skipped</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {{
                                                        no_key: "No API key saved yet — save one above first.",
                                                        quota_exceeded: "Quota/rate limit reached.",
                                                        error: "An error occurred while contacting the AI provider.",
                                                    }[testDocResult.reason] || testDocResult.reason}
                                                    {testDocResult.error ? ` (${testDocResult.error})` : ""}
                                                </p>
                                            </div>
                                        </div>
                                    ) : testDocResult.valid ? (
                                        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-emerald-800">Valid — AI would accept this upload</p>
                                                <p className="text-sm text-emerald-700 mt-1">{testDocResult.reason}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-red-800">
                                                    Flagged — AI would reject this upload ({{
                                                        nudity: "Inappropriate Content",
                                                        minor: "Minor/Child Detected",
                                                        gender_mismatch: "Gender Mismatch",
                                                        mismatch: "Wrong Document Type",
                                                        unreadable: "Unreadable",
                                                    }[testDocResult.issue] || testDocResult.issue})
                                                </p>
                                                <p className="text-sm text-red-700 mt-1">{testDocResult.reason}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#23471d]/10 rounded-full flex items-center justify-center text-[#23471d]">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
                            </div>
                            <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                This AI Document Verification system automatically scans uploaded documents to ensure they are the correct type and contain no inappropriate content.
                            </p>
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 text-sm">How to get an API Key:</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                                    <li><strong>Google Gemini:</strong> Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a> to get a free API key.</li>
                                    <li><strong>OpenAI:</strong> Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a>, sign in, and generate a new secret key (Requires paid credits).</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800">
                                    We recommend using the free tier of Google Gemini for cost-effective automated verification, as it provides a generous daily allowance for free.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowHelpModal(false)} className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

