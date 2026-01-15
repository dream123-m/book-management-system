import axios  from 'axios'

export default{
    common:{
        method:'GET',
        data:{},
        params:{}
    },
    $axios(options={}){
        options.method=options.method || this.common.method
        options.data=options.data || this.common.data
        options.params=options.params || this.common.params

        // 加载动画请求前
        return axios(options).then(v =>{
            let data =v.data.data
            return new Promise((resolve, reject) => {
                if(!v) return reject()
                    // 请求结束
                resolve(data)
            })
        })
    }
}