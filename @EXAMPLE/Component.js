import PropTypes from 'prop-types'; // To specify the type of props, we can import PropTypes and set the specific type below.


const Component = (props) => {  // The name props can be used by <Component name="Hello">
    return (
        <div>
            <h1>{props.name}</h1>
        </div>
    )
}


// Below is a object to set the default props if the props have not specified.
Component.defaultProps = {
    name: "default content"
}

// To set the type of the props, set the component with .propTypes to a object.
Component.propTypes = {
    name: PropTypes.string.isRequired,  // If the prop is not required, remove .isRequired.
}

export default Component
