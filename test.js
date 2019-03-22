const deltachat = require('./index')
const binding = require('./binding')
const C = require('./constants')

function setup_dc(cb) {
  let dc = new deltachat()
  
  dc.on('ALL', (event, data1, data2) => {
    //console.log(event, data1, data2)
  })

  dc.open('/home/kerle/.config/DeltaChat/6a696b7374726140646973726f6f742e6f7267', (err) => {
    if(err) throw err
    console.log('Opened!')
    cb(dc)
  })
}

function main(dc) {
  let chats = dc.getChats()
  //let msg = binding.dcn_msg_new(dc.dcn_context, C.DC_MSG_TEXT)
  //binding.dcn_msg_set_text(msg, 'test237')
  //binding.dcn_set_draft(dc.dcn_context, 13, msg)

  const a = binding.dcn_get_locations(dc.dcn_context, 255, 10)
  const b = binding.dcn_array_get_cnt(a)
  const c = binding.dcn_array_get_id(a, 0)
  const d = binding.dcn_array_get_accuracy(a, 2)
  console.log(a, b, c, d)
}

setup_dc(main)

