<template>
    <div class="p-2">
        <input type="text" class="form-control" v-model="value" placeholder="Keresés...">
    </div>
</template>

<script>
export default {
    name: "Searchbar",
    props: {
        type: String,
    },
    data() {
        return {
            value: "",
            timeout: null,
        }
    },
    watch: {
        value() {
            clearTimeout(this.timeout)
            
            let val = this.value
            if (val == "") {
                this.$emit("clear")
                return
            }
            let valArr = val.split(" ")
            if (valArr.every(piece => piece.length == 0)) {
                return
            }


            this.timeout = setTimeout( async () => {
                console.log("keresés kuldve");
                let res = await this.axios(`/api/search/${this.type}`, "post", { val })
                if (res.error) {
                    console.log("error");
                    return
                }
                this.$emit("gotResult", res.data)
            }, 750);
        }
    }
}
</script>