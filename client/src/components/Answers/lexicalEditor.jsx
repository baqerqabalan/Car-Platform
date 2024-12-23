// TextEditor.js
import { Box } from '@mui/material';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import './lexical-theme.css'; // Your custom styles for the editor

const TextEditor = ({ setAnswerContent }) => {

  const handleChange = (value) => {
    setAnswerContent(value); 
  };

  // Toolbar options
  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ align: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['link'],
      ['clean'], // Removes formatting
    ],
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'align',
    'color',
    'background',
    'link',
    'image',
    'video',
    'script',
  ];

  return (
    <Box>
      <ReactQuill
        onChange={handleChange}
        required
        modules={modules}
        formats={formats}
        name="content"
        theme="snow" 
        placeholder="Start writing here..."
        style={{
          minHeight: '300px', // Minimum height for the editor
          border: '1px solid #e0e0e0', // Border around the Quill editor
          borderRadius: '4px', // Rounded corners for the editor
        }}
      />
    </Box>
  );
};

export default TextEditor;