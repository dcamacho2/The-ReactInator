/**react is all about modularity and composable components, I'll try and use the following structure:
*   -ComentBox
*       -CommentList
*           -Comment
*       -CommentForm
*/
var ComentBox = React.createClass({
  loadCommentsFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data: data});//key to dynamic updtaes
      }.bind(this),
      error: function(xhr, status, err){
        console.log(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    console.log(comment);
    console.log(this.props.url);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data){
        this.setState({data: data});//key to dynamic updtaes
      }.bind(this),
      error: function(xhr, status, err){
        console.log(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {//called automatically by React when a component is rendered
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() { //I pass methods in a javascript object to 'React.createClass()' to create a new React component
    return (
      <div className="ComentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <hr />
        <CommentForm onComponentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({ //CommentList component
  render: function(){
    var commentNodes = this.props.data.map(function(comment, index) {//map is like a for loop
      return (
        <Comment author={comment.author} key={index}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="CommentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm =  React.createClass({ //CommentForm component
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if(!text || !author){
      return;
    }
    this.props.onComponentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value ='';
    return;
  },
  render: function() {
    return (
      <form className="CommentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your Name" ref="author" />
        <input type="text" placeholder="Say Something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Comment = React.createClass({ //Comment component, depends on data being passed from its parent. Data is available as a property on the child component, accesible through 'this.props'
  render: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="Comment">
        <h2 className="comment">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

React.render( //returns a tree of React components that will eventually render to HTML
  <ComentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);