export const Footer = (props) => {
  return (
    <div id='footer' className='text-center'>
      <div className="row main-member">
        <div className="col-sm-12 col-md-3">
          <video autoPlay loop muted style={{width:'100%'}}>
            <source src="video/COMMON.mp4" type="video/mp4"/>
          </video>
        </div>
        <div className="col-sm-12 col-md-3">
          <video autoPlay loop muted style={{width:'100%'}}>
            <source src="video/RARE.mp4" type="video/mp4"/>
          </video>
        </div>
        <div className="col-sm-12 col-md-3">
          <video autoPlay loop muted style={{width:'100%'}}>
            <source src="video/EPIC.mp4" type="video/mp4"/>
          </video>
        </div>
        <div className="col-sm-12 col-md-3">
          <video autoPlay loop muted style={{width:'100%'}}>
            <source src="video/LEGENDARY.mp4" type="video/mp4"/>
          </video>
        </div>
      </div>
    </div>
  )
}
