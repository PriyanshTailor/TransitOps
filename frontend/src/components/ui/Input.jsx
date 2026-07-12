import './Input.css';

const Input = ({ label, type = 'text', id, error, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input 
        type={type} 
        id={id} 
        className={`input-field ${error ? 'input-error' : ''}`} 
        {...props} 
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;
