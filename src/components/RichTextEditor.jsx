import React, { useRef, useEffect } from 'react';
import { Link as LinkIcon } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder, minHeight = "300px", isCodeEditor = false }) => {
    const editorRef = useRef(null);

    // Sync from parent to editor (initial load or external updates)
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    const execCommand = (command, val = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
            // Store current selection if possible
            document.execCommand(command, false, val);
            handleInput();
        }
    };

    const handleInput = () => {
        if (onChange) {
            onChange(editorRef.current?.innerHTML || "");
        }
    };

    const handlePaste = (e) => {
        if (isCodeEditor) {
            // For code editor, paste as plain text
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        } else {
            // Standard paste behavior
            e.preventDefault();
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');
            if (html) {
                document.execCommand('insertHTML', false, html);
            } else {
                document.execCommand('insertText', false, text);
            }
        }
    };

    const insertLink = (e) => {
        e.preventDefault();
        const url = prompt("Enter URL:");
        if (url) {
            execCommand("createLink", url);
        }
    };

    // Helper to handle toolbar actions without losing focus
    const handleAction = (e, command, val = null) => {
        e.preventDefault(); // CRITICAL: Prevents focus loss
        execCommand(command, val);
    };

    return (
        <div className="border-2 border-gray-200 rounded overflow-hidden shadow-inner bg-white">
            {/* Standardized Toolbar - Hidden in code mode or customized if needed */}
            {!isCodeEditor && (
                <div className="bg-gray-50 p-2 border-b-2 border-gray-200 flex flex-wrap gap-1 items-center">
                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "bold")}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white rounded font-bold border-2 border-gray-300 text-sm shadow-sm bg-white active:bg-gray-100"
                        title="Bold"
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "italic")}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white rounded italic border-2 border-gray-300 text-sm shadow-sm bg-white active:bg-gray-100"
                        title="Italic"
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "underline")}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white rounded underline border-2 border-gray-300 text-sm shadow-sm bg-white active:bg-gray-100"
                        title="Underline"
                    >
                        U
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "justifyLeft")}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 border-gray-300 text-lg shadow-sm bg-white active:bg-gray-100"
                        title="Align Left"
                    >
                        ≡
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "justifyCenter")}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 border-gray-300 text-lg shadow-sm bg-white active:bg-gray-100"
                        title="Align Center"
                    >
                        ≡
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "justifyRight")}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 border-gray-300 text-lg shadow-sm bg-white active:bg-gray-100"
                        title="Align Right"
                    >
                        ≡
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "insertUnorderedList")}
                        className="px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 border-gray-300 text-[11px] font-bold shadow-sm bg-white gap-1 active:bg-gray-100"
                        title="Bullet List"
                    >
                        <span className="text-lg">●</span> List
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => handleAction(e, "insertOrderedList")}
                        className="px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 border-gray-300 text-[11px] font-bold shadow-sm bg-white gap-1 active:bg-gray-100"
                        title="Numbered List"
                    >
                        1. List
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <select
                        onChange={(e) => {
                            execCommand("formatBlock", e.target.value);
                            e.target.value = "p"; // Reset to Body Text after selection so it's ready for the next action
                        }}
                        className="h-9 border-2 border-gray-300 text-[11px] font-bold px-2 bg-white rounded shadow-sm focus:outline-none min-w-[100px] cursor-pointer"
                    >
                        <option value="p">Body Text</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="h5">Heading 5</option>
                        <option value="h6">Heading 6</option>
                    </select>

                    <button
                        type="button"
                        onMouseDown={insertLink}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 border-gray-300 text-sm shadow-sm bg-white text-blue-600 active:bg-gray-100"
                        title="Insert Link"
                    >
                        <LinkIcon size={16} />
                    </button>
                </div>
            )}

            {/* Editable Content Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className={`p-6 focus:outline-none max-w-none text-gray-700 bg-white overflow-y-auto leading-relaxed ${isCodeEditor ? 'font-mono text-sm' : 'prose'}`}
                style={{
                    minHeight: minHeight,
                }}
                placeholder={placeholder}
            ></div>

            {/* In-component styling for common elements */}
            <style dangerouslySetInnerHTML={{
                __html: `
                [contenteditable] {
                    outline: none;
                    color: #333333 !important;
                    text-align: justify !important;
                    line-height: 1.6 !important;
                }
                [contenteditable] p, [contenteditable] li, [contenteditable] span {
                    color: #333333 !important;
                }
                [contenteditable] a {
                    color: #2563eb !important;
                    text-decoration: underline !important;
                    cursor: pointer;
                    font-weight: 600 !important;
                }
                [contenteditable]:empty:before {
                    content: attr(placeholder);
                    color: #9ca3af;
                    font-style: italic;
                    pointer-events: none;
                }
                [contenteditable] ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                }
                [contenteditable] ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                }
                [contenteditable] b, [contenteditable] strong {
                    font-weight: 800 !important;
                    color: #000000 !important;
                }
                [contenteditable] i, [contenteditable] em {
                    font-style: italic !important;
                    color: #333333 !important;
                }
                [contenteditable] h1, [contenteditable] h2, [contenteditable] h3, [contenteditable] h4, [contenteditable] h5, [contenteditable] h6 {
                    color: #000000 !important;
                    font-weight: 800 !important;
                    margin-top: 1rem !important;
                    margin-bottom: 0.5rem !important;
                }
                [contenteditable] h2 {
                    font-size: 1.5rem !important;
                }
                [contenteditable] h3 {
                    font-size: 1.25rem !important;
                }
            ` }} />
        </div>
    );
};

export default RichTextEditor;
