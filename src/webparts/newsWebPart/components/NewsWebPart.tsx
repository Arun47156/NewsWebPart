import * as React from 'react';
import styles from './NewsWebPart.module.scss';
import { INewsWebPartProps } from './INewsWebPartProps';
import { TextField } from 'office-ui-fabric-react';
import { Web } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface GetHTMLProps {
  items: any;
}

export class GetHTML extends React.Component<GetHTMLProps> {
  constructor(props){
    super(props)
  }

  showNews = (e)=>{
    let div_news = e.target.parentNode.parentNode.children[1]
    if(div_news.style.display == 'flex'){
      div_news.style.display = 'none'
    }else{
      div_news.style.display = 'flex'
    }
  }

  formatDate(datetime){
    let d = new Date(datetime)
    return d.toLocaleString('default', { month: 'long' })+' '+d.getDate()+', '+d.getFullYear()
  }

  render(){
    const { items } = this.props;
    return(
      <> 
        {items && items.map((item,i)=>
          <div className={ styles.row } >
            <div>
              <span className={styles.img_btn} onClick={(e)=>this.showNews(e)}>Read</span>
              {item.URL ? <a href={item.URL} target="_blank"><p>{item.Title}</p></a> : <p>{item.Title}</p>}
              <p>{item.Author0}<span>&nbsp;|&nbsp;{this.formatDate(item.CreatedTime)}</span></p>
            </div>
            <div className={styles.news_box}>
              {item.Image && <img src={JSON.parse(item.Image).serverUrl+JSON.parse(item.Image).serverRelativeUrl} className={styles.news_img} onClick={(e)=>window.open(e.currentTarget.src)}/>}
              <p>{item.Content}</p>
            </div>
          </div>
        )}
      </>
    )
  }
}

export interface IStates {
  Items: any;
  User: {};
  Permission: any;
  title: string;
  url: string;
  content: string;
  imgfile: any;
}

export default class NewsWebPart extends React.Component<INewsWebPartProps, IStates,{}> {

  constructor(props) {
    super(props);
    this.state = {
      Items: [],
      User: {},
      Permission: null,
      title: '',
      url: '',
      content: '',
      imgfile: null
    };
  }

  public async componentDidMount() {
    await this.fetchUserPermission()
    await this.fetchNews();
  }

  async fetchUserPermission(){
    let web = Web(this.props.webURL);
    await web.currentUser.get().then((obj)=>this.setState({User:obj}))
    await web.lists.getByTitle("Members").items.filter('SiteMemberId eq '+this.state.User['Id']).get().then((obj)=>this.setState({Permission: obj[0].Title}))
  }

  async fetchNews() {
    let web = Web(this.props.webURL);
    const items: any[] = await web.lists.getByTitle("MembersNews").items.orderBy('CreatedTime', false).get()
    this.setState({ Items: items });
  }

  post_btn_event =(e)=>{
    if(e.target.innerHTML == 'Back'){
      // console.log((document.getElementById("title") as HTMLInputElement).value)
      (document.querySelectorAll('#row2 input, #row2 textarea') as NodeList).forEach((element)=>{
        (element as HTMLInputElement).value = null;
      })
      this.setState({title: null, url: null, content: null, imgfile: null})
      document.getElementById('box1').style.display = 'block'
      document.getElementById('box2').style.display = 'none'
    }else{
      document.getElementById('box1').style.display = 'none'
      document.getElementById('box2').style.display = 'block'
    }
  }

  is_valid(val){ if(val && val.trim().length > 0 ){return true} else {return false} }
  is_valid_url(val){
    if(val==null || val.length == 0){return true}else{
      var regex = new RegExp("((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)");
      if (val.match(regex)){return true}else{return false}
    }
  }
  
  add_post= async ()=>{
    const {title, content, url, imgfile} = this.state
    if(this.is_valid(title) && this.is_valid(content)){
      if(this.is_valid_url(url)){
        let base_url = this.props.context.pageContext.site.absoluteUrl.split('/')
        let web = Web(this.props.webURL);

        if(this.state.imgfile){
          let fname = this.state.imgfile[0].name.split('.')
          fname = fname.slice(0, fname.length-1)+'_'+new Date().valueOf()+'.'+fname[fname.length-1]
          await web.getFolderByServerRelativeUrl(this.props.context.pageContext.web.serverRelativeUrl + "/MemberNewsItems")
            .files.add(fname, this.state.imgfile[0], false)
            .then((data) =>{
              this.setState({imgfile: data})
          })
        }

        await web.lists.getByTitle("MembersNews").items.add({
          Title: title,
          Content: content,
          URL: url,
          CreatedTime: new Date(),
          Author0: this.state.User['Title'],
          Image: this.state.imgfile ? JSON.stringify({
              "fileName": this.state.imgfile.data.Name,
              "serverUrl": base_url[0]+'//'+base_url[2]+'/',
              "serverRelativeUrl": this.state.imgfile.data.ServerRelativeUrl}) : null
        }).then(async ()=>{
          alert('Post added.');
          (document.querySelectorAll('#row2 input, #row2 textarea') as NodeList).forEach((element)=>{
            (element as HTMLInputElement).value = null;
          })
          this.setState({title: null, url: null, content: null, imgfile: null})
          document.getElementById('box1').style.display = 'block'
          document.getElementById('box2').style.display = 'none'
          await this.fetchNews();
        })

      }else{alert('Invalid Source URL')}
    }else{alert('Title and Content should not be empty.')}
  }

  public render(): React.ReactElement<INewsWebPartProps> {
    return (
      <div className={ styles.newsWebPart }>
        <div className={ styles.container } id='box1'>
            {this.state.Permission=='Edit' && <button className={styles.img_btn_2} onClick={(e)=>this.post_btn_event(e)}>Add +</button>}
            <h1 className={styles.title}>{this.props.title}</h1>
            <GetHTML items={this.state.Items}/>
        </div>

        {this.state.Permission=='Edit' && 
          <div className={ styles.container2 } id='box2' >
            <button className={styles.img_btn_2} onClick={(e)=>this.post_btn_event(e)}>Back</button>
            <h1 className={styles.title}>Add new post</h1>
            <div className={styles.row2} id='row2'>
              <label form="title">Title: *</label>
              <input type='text' name='title' id='title' onChange={(e)=>{this.setState({title: e.target.value})}}/>
              <label form="url">Source URL: </label>
              <input type='text' name='url' id='url' onChange={(e)=>{this.setState({url: e.target.value})}}/>
              <label form="content">Content: *</label>
              <textarea rows={4} cols={10} name='content' id='content' onChange={(e)=>{this.setState({content: e.target.value})}}/>
              <label form="imgfile">Upload Image: </label>
              <input type='file' name='imgfile' id='imgfile' accept="image/*" onChange={(e)=>{this.setState({imgfile: e.target.files})}}/>
              <button className={styles.img_btn_3} onClick={this.add_post}>Post</button>
            </div>
          </div>
        }
      </div>
    );
  }
}
